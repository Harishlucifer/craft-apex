# Workflow System Architecture (Performance Optimized)

## Overview

This document outlines the architecture for a dynamic workflow system that constructs UI components based on API responses and handles workflow execution for different types of processes including Lead Creation, Partner Onboarding, and Verification Flow.

**Performance Improvements:**
- Context-based state management replacing heavy Redux usage
- Optimized component rendering with React.memo and useMemo
- Intelligent caching and data fetching strategies
- Code splitting and lazy loading for better bundle management
- Virtual scrolling for large datasets

## System Flow

### 1. Page Navigation Flow

When navigating to different detail pages:
- **Application Detail Page** → Uses `LEAD_CREATION` workflow type
- **Partner Detail Page** → Uses `PARTNER_ONBOARDING` workflow type  
- **Verification Detail Page** → Uses `VERIFICATION_FLOW` workflow type

### 2. Workflow Build Process

1. Extract `source_id` from URL parameters
2. Determine appropriate `workflow_type` based on current page
3. Call Workflow Build API with the parameters
4. Construct UI components based on API response
5. Handle component interactions and data collection

### 3. Workflow Execution Process

1. Components emit payload data when user interactions occur
2. Call appropriate Create API with collected payload
3. On successful creation, call Workflow Execute API
4. Update application state with new workflow response
5. Refresh UI components with updated data

## API Endpoints

### Workflow Build API

```bash
curl --location '{$baseUrl}/alpha/v1/workflow/build' \
--header 'Authorization: Bearer ****' \
--header 'Content-Type: application/json' \
--data '{
    "workflow_type": "LEAD_CREATION",
    "source_id": "174530530585200669"
}'
```

**Workflow Types:**
- `LEAD_CREATION` - For application/lead workflows
- `PARTNER_ONBOARDING` - For partner registration workflows
- `VERIFICATION_FLOW` - For verification processes

### Workflow Execute API

```bash
curl --location '{$baseUrl}/alpha/v1/workflow/execute' \
--header 'Authorization: Bearer ****' \
--header 'Content-Type: application/json' \
--data '{
    "workflow_instance_id": "175448253304572264",
    "step_id": "174765010630866898",
    "payload": { /* component data */ }
}'
```

## Optimized State Management Architecture

### Context-Based State Management

Replacing heavy Redux usage with optimized Context API and useReducer patterns:

```typescript
// contexts/WorkflowContext.tsx
const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'SET_WORKFLOW':
      return { 
        ...state, 
        workflow: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_CURRENT_STEP':
      return { 
        ...state, 
        currentStepIndex: action.payload,
        lastUpdated: Date.now()
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'OPTIMISTIC_UPDATE':
      return {
        ...state,
        optimisticUpdates: {
          ...state.optimisticUpdates,
          [action.payload.stepId]: action.payload.data
        }
      };
    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, {
    workflow: null,
    currentStageIndex: 0,
    currentStepIndex: 0,
    loading: false,
    error: null,
    optimisticUpdates: {},
    lastUpdated: null
  });
  
  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};
```

### Performance-Optimized Hooks

```typescript
// hooks/useWorkflow.ts
export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};

// Selective state access to prevent unnecessary re-renders
export const useCurrentStep = () => {
  const { state } = useWorkflow();
  return useMemo(() => {
    if (!state.workflow?.stages?.[state.currentStageIndex]) return null;
    return state.workflow.stages[state.currentStageIndex].steps?.[state.currentStepIndex];
  }, [state.workflow, state.currentStageIndex, state.currentStepIndex]);
};

export const useWorkflowNavigation = () => {
  const { state, dispatch } = useWorkflow();
  
  const navigateToStep = useCallback((stageIndex: number, stepIndex: number) => {
    dispatch({ type: 'UPDATE_CURRENT_STAGE', payload: stageIndex });
    dispatch({ type: 'UPDATE_CURRENT_STEP', payload: stepIndex });
  }, [dispatch]);
  
  const nextStep = useCallback(() => {
    const currentStage = state.workflow?.stages?.[state.currentStageIndex];
    if (!currentStage) return;
    
    if (state.currentStepIndex < currentStage.steps.length - 1) {
      dispatch({ type: 'UPDATE_CURRENT_STEP', payload: state.currentStepIndex + 1 });
    } else if (state.currentStageIndex < state.workflow.stages.length - 1) {
      dispatch({ type: 'UPDATE_CURRENT_STAGE', payload: state.currentStageIndex + 1 });
      dispatch({ type: 'UPDATE_CURRENT_STEP', payload: 0 });
    }
  }, [state, dispatch]);
  
  return { navigateToStep, nextStep };
};
```

## Class Architecture

### Base Workflow Class (Performance Optimized)

```typescript
abstract class BaseWorkflow {
  protected baseUrl: string;
  protected authToken: string;
  protected workflowType: string;
  protected sourceId: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  constructor(baseUrl: string, authToken: string, workflowType: string, sourceId: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
    this.workflowType = workflowType;
    this.sourceId = sourceId;
  }
  
  /**
   * Build workflow and construct UI components with caching
   */
  async build(data: any = {}): Promise<WorkflowBuildResponse> {
    const cacheKey = this.getCacheKey(data);
    
    // Return cached result if available and not stale
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }
    
    // Prevent duplicate requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    const request = this.fetchWorkflow(data);
    this.pendingRequests.set(cacheKey, request);
    
    try {
      const result = await request;
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchWorkflow(data: any): Promise<WorkflowBuildResponse> {
    const response = await fetch(`${this.baseUrl}/alpha/v1/workflow/build`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_type: this.workflowType,
        source_id: this.sourceId,
        ...data
      })
    });
    
    return response.json();
  }
  
  /**
   * Execute workflow step with payload
   */
  async execute(workflowInstanceId: string, stepId: string, payload: any): Promise<WorkflowExecuteResponse> {
    const response = await fetch(`${this.baseUrl}/alpha/v1/workflow/execute`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workflow_instance_id: workflowInstanceId,
        step_id: stepId,
        payload: payload
      })
    });
    
    // Invalidate cache after execution
    this.cache.clear();
    
    return response.json();
  }

  private getCacheKey(data: any): string {
    return `${this.workflowType}-${this.sourceId}-${JSON.stringify(data)}`;
  }
  
  /**
   * Abstract method for handling workflow-specific logic
   */
  abstract processWorkflowData(data: any): any;
  
  /**
   * Abstract method for creating entities
   */
  abstract create(payload: any): Promise<any>;
}
```

### Lead Creation Workflow

```typescript
class LeadCreationWorkflow extends BaseWorkflow {
  constructor(baseUrl: string, authToken: string, sourceId: string) {
    super(baseUrl, authToken, 'LEAD_CREATION', sourceId);
  }
  
  processWorkflowData(data: WorkflowBuildResponse): LeadWorkflowData {
    // Process lead-specific workflow data
    // Extract stages, steps, form configurations
    return {
      stages: data.data.stages,
      utilities: data.data.configuration.utilities,
      // ... other lead-specific processing
    };
  }
  
  async create(payload: LeadCreationPayload): Promise<LeadCreationResponse> {
    const response = await fetch(`${this.baseUrl}/alpha/v1/application`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return response.json();
  }
}
```

### Partner Onboarding Workflow

```typescript
class PartnerOnboardingWorkflow extends BaseWorkflow {
  constructor(baseUrl: string, authToken: string, sourceId: string) {
    super(baseUrl, authToken, 'PARTNER_ONBOARDING', sourceId);
  }
  
  processWorkflowData(data: WorkflowBuildResponse): PartnerWorkflowData {
    // Process partner-specific workflow data
    return {
      stages: data.data.stages,
      partnerTypes: data.data.configuration.partner_types,
      // ... other partner-specific processing
    };
  }
  
  async create(payload: PartnerCreationPayload): Promise<PartnerCreationResponse> {
    const response = await fetch(`${this.baseUrl}/alpha/v1/partner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return response.json();
  }
}
```

### Verification Workflow

```typescript
class VerificationWorkflow extends BaseWorkflow {
  constructor(baseUrl: string, authToken: string, sourceId: string) {
    super(baseUrl, authToken, 'VERIFICATION_FLOW', sourceId);
  }
  
  processWorkflowData(data: WorkflowBuildResponse): VerificationWorkflowData {
    // Process verification-specific workflow data
    return {
      stages: data.data.stages,
      verificationTypes: data.data.configuration.verification_types,
      // ... other verification-specific processing
    };
  }
  
  async create(payload: VerificationPayload): Promise<VerificationResponse> {
    const response = await fetch(`${this.baseUrl}/alpha/v1/verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    return response.json();
  }
}
```

## Workflow Factory

```typescript
class WorkflowFactory {
  static createWorkflow(type: string, baseUrl: string, authToken: string, sourceId: string): BaseWorkflow {
    switch (type) {
      case 'LEAD_CREATION':
        return new LeadCreationWorkflow(baseUrl, authToken, sourceId);
      case 'PARTNER_ONBOARDING':
        return new PartnerOnboardingWorkflow(baseUrl, authToken, sourceId);
      case 'VERIFICATION_FLOW':
        return new VerificationWorkflow(baseUrl, authToken, sourceId);
      default:
        throw new Error(`Unsupported workflow type: ${type}`);
    }
  }
}
```

## Component Integration

### Workflow Component

```typescript
interface WorkflowComponentProps {
  workflowType: string;
  sourceId: string;
  onStepComplete?: (stepId: string, payload: any) => void;
  onWorkflowComplete?: (workflowId: string) => void;
}

const WorkflowComponent: React.FC<WorkflowComponentProps> = ({
  workflowType,
  sourceId,
  onStepComplete,
  onWorkflowComplete
}) => {
  const [workflowData, setWorkflowData] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const workflow = useMemo(() => 
    WorkflowFactory.createWorkflow(workflowType, baseUrl, authToken, sourceId),
    [workflowType, sourceId]
  );
  
  useEffect(() => {
    loadWorkflow();
  }, [workflow]);
  
  const loadWorkflow = async () => {
    try {
      const data = await workflow.build();
      const processedData = workflow.processWorkflowData(data);
      setWorkflowData(processedData);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };
  
  const handleStepSubmit = async (stepId: string, payload: any) => {
    try {
      // Create entity first
      const createResponse = await workflow.create(payload);
      
      // Execute workflow step
      const executeResponse = await workflow.execute(
        workflowData.workflowInstanceId,
        stepId,
        payload
      );
      
      // Update workflow data with new state
      const updatedData = workflow.processWorkflowData(executeResponse);
      setWorkflowData(updatedData);
      
      onStepComplete?.(stepId, payload);
    } catch (error) {
      console.error('Failed to execute workflow step:', error);
    }
  };
  
  return (
    <div className="workflow-container">
      {workflowData?.stages.map(stage => (
        <StageComponent
          key={stage.id}
          stage={stage}
          onStepSubmit={handleStepSubmit}
        />
      ))}
    </div>
  );
};
```

## Data Flow

1. **Initialization**
   - Extract `source_id` from URL
   - Determine `workflow_type` based on current page
   - Create appropriate workflow instance using factory

2. **Build Phase**
   - Call `workflow.build()` to get workflow configuration
   - Process workflow data using `processWorkflowData()`
   - Render UI components based on stages and steps

3. **Interaction Phase**
   - User interacts with form components
   - Components emit payload data on submission
   - Call `workflow.create()` with collected payload

4. **Execution Phase**
   - On successful creation, call `workflow.execute()`
   - Update workflow state with new data
   - Refresh UI components with updated information

## Error Handling

- Implement retry mechanisms for API failures
- Provide user-friendly error messages
- Log errors for debugging purposes
- Graceful degradation when workflow data is unavailable

## State Management

- Use React Context or Redux for global workflow state
- Cache workflow configurations to avoid repeated API calls
- Implement optimistic updates for better user experience
- Handle concurrent workflow executions

## Testing Strategy

- Unit tests for each workflow class
- Integration tests for API interactions
- Component tests for UI rendering
- End-to-end tests for complete workflow flows

## Performance Considerations

- Lazy load workflow components
- Implement pagination for large workflow datasets
- Cache frequently accessed workflow configurations
- Optimize API calls with request batching

## Security

- Validate all user inputs before API calls
- Implement proper authentication and authorization
- Sanitize workflow configuration data
- Use HTTPS for all API communications

## Future Enhancements

- Support for custom workflow types
- Real-time workflow status updates
- Workflow analytics and reporting
- Multi-language support for workflow content
- Workflow versioning and rollback capabilities