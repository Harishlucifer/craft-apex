import {useCallback} from 'react';
import {useAuthStore} from '@repo/shared-state/stores';
import {useWorkflowStore, Step, Workflow} from '../stores/workflow';
import {useMutation, useQueryClient} from '@repo/shared-state/query';
import {toast} from "sonner";

export const useWorkflow = (sourceId?: string) => {
    const apiUrl = import.meta.env.VITE_API_ENDPOINT;
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const {
        workflow,
        workflowType,
        currentStageIndex,
        currentStepIndex,
        currentStageData,
        currentStepData,
        loading,
        progress,
        completedStages,
        completedSteps,
        setWorkflow,
        setWorkflowType,
        setLoading,
        goToNextStep,
        goToPreviousStep,
        goToStage,
        markStepCompleted,
        markStageCompleted,
        reset,
    } = useWorkflowStore();

    /**
     * Fetch workflow (POST API → useMutation)
     */
    const fetchWorkflowMutation = useMutation<Workflow | null, Error, { id: string; type: string }>({
        mutationFn: async ({id, type}) => {
            setWorkflowType(type);

            const res = await fetch(`${apiUrl}/alpha/v1/workflow/build`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({workflow_type: type, source_id: id}),
            });

            if (res.status === 204) return null;
            const text = await res.text();
            if (!text) return null;
            const data = JSON.parse(text);
            return data.data as Workflow;
        },
        onMutate: () => setLoading(true),
        onSuccess: (data) => {
            if (data) {
                setWorkflow(data);
                console.log('✅ Workflow response:', data);
            }
        },
        onError: (err) => {
            console.error('❌ fetchWorkflow error:', err);
        },
        onSettled: () => setLoading(false),
    });

    const fetchWorkflow = useCallback(
        (id: string, type: string = 'LEAD_CREATION') =>
            fetchWorkflowMutation.mutateAsync({id, type}),
        [fetchWorkflowMutation]
    );

    /**
     * Execute workflow step (POST API → useMutation)
     */
    type ExecutionResult = { success: boolean; data: Workflow | null };

    const executeWorkflowMutation = useMutation<
        ExecutionResult,
        Error,
        { stepData: Step; id: string; type: string }
    >({
        mutationFn: async ({stepData, id, type}) => {
            const res = await fetch(`${apiUrl}/alpha/v1/workflow/execution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({
                    execute_step_id: stepData.id,
                    workflow_type: type,
                    source_id: id,
                }),
            });

            if (res.status === 204) return {success: true, data: null};
            const text = await res.text();
            if (!text) return {success: false, data: null};
            const data = JSON.parse(text);
            return {success: res.status === 200, data: data.data};
        },
        onMutate: () => setLoading(true),
        onSuccess: (result) => {
            if (result.success && result.data) {
                setWorkflow(result.data);
                queryClient.invalidateQueries({queryKey: ['workflow', sourceId, workflowType]});
            }
        },
        onError: (error) => {
            console.error('❌ executeWorkflow error:', error);
        },
        onSettled: () => setLoading(false),
    });

    const executeWorkflow = useCallback(
        async (stepData: Step, id: string, type: string = 'LEAD_CREATION') => {
            try {
                const result = await executeWorkflowMutation.mutateAsync({stepData, id, type});
                return result.success;
            } catch {
                return false;
            }
        },
        [executeWorkflowMutation]
    );

    /**
     * Handle next step navigation
     */
    const handleNextStep = useCallback(async () => {
        if (!sourceId || !currentStepData) return;
        const executed = await executeWorkflow(currentStepData, sourceId, workflowType);
        if (executed) toast.success('Step executed successfully',{position: 'top-right',duration: 1500});
        else toast.error('Step execution failed',{position: 'top-right'});
    }, [sourceId, currentStepData, executeWorkflow, goToNextStep, workflowType]);

    return {
        // State
        workflow,
        workflowType,
        currentStageIndex,
        currentStepIndex,
        currentStageData,
        currentStepData,
        loading,
        progress,
        completedStages,
        completedSteps,

        // Derived query states
        isError: fetchWorkflowMutation.isError || executeWorkflowMutation.isError,
        isSuccess: fetchWorkflowMutation.isSuccess,

        // Actions
        fetchWorkflow,
        executeWorkflow,
        handleNextStep,
        goToPreviousStep,
        goToStage,
        markStepCompleted,
        markStageCompleted,
        reset,
    };
};
