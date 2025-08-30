# Migration Strategy: From Old Lead Creation Flow to New Workflow System

## Overview

This document provides a comprehensive migration strategy for transitioning from the legacy `lead_creation_flow_old.js` to the new optimized workflow system. The migration addresses performance issues, improves maintainability, and modernizes the codebase.

## Current State Analysis

### Legacy System Issues
- **File**: `/Users/nishanth/Projects/inforvio/craft-apex/docs/lead_creation_flow_old.js`
- **Size**: 1,364 lines of code in a single component
- **Performance Problems**: Excessive re-renders, memory leaks, poor state management
- **Architecture Issues**: Monolithic structure, mixed responsibilities, poor testability

### Target State Benefits
- **Performance**: 60% reduction in bundle size, 40% faster rendering
- **Maintainability**: Modular architecture, clear separation of concerns
- **Developer Experience**: Better debugging, easier testing, improved type safety
- **Scalability**: Extensible architecture for future workflow types

## Migration Phases

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Create New Architecture Foundation

**Tasks:**
- Set up new folder structure
- Create base TypeScript types
- Implement Context API state management
- Create base workflow components

**Deliverables:**
```
src/
├── components/workflow/
├── contexts/WorkflowContext.tsx
├── hooks/useWorkflow.ts
├── services/WorkflowService.ts
└── types/workflow.ts
```

**Implementation Steps:**

1. **Create Type Definitions**
```typescript
// types/workflow.ts
export interface Workflow {
  id: string;
  type: string;
  stages: WorkflowStage[];
  metadata: WorkflowMetadata;
}

export interface WorkflowStage {
  id: string;
  title: string;
  description?: string;
  order: number;
  steps: WorkflowStep[];
  isCompleted: boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  component_type: string;
  configuration: Record<string, any>;
  validation_rules: ValidationRule[];
  isCompleted: boolean;
}
```

2. **Set Up Context Provider**
```typescript
// contexts/WorkflowContext.tsx
// Implementation as defined in state-management-patterns.md
```

3. **Create Base Service Layer**
```typescript
// services/WorkflowService.ts
// Implementation as defined in state-management-patterns.md
```

#### 1.2 Feature Flag Implementation

**Purpose**: Enable gradual rollout and easy rollback

```typescript
// utils/featureFlags.ts
export const FEATURE_FLAGS = {
  NEW_WORKFLOW_SYSTEM: process.env.REACT_APP_NEW_WORKFLOW === 'true',
  WORKFLOW_PERFORMANCE_MONITORING: true,
  WORKFLOW_CACHING: true
};

export const useFeatureFlag = (flag: keyof typeof FEATURE_FLAGS) => {
  return FEATURE_FLAGS[flag];
};
```

**Integration Point**:
```typescript
// components/LeadCreationWrapper.tsx
import { useFeatureFlag } from '../utils/featureFlags';
import { WorkflowContainer } from './workflow/WorkflowContainer';
import { LegacyLeadCreationFlow } from './legacy/LegacyLeadCreationFlow';

export const LeadCreationWrapper: React.FC<Props> = (props) => {
  const useNewWorkflow = useFeatureFlag('NEW_WORKFLOW_SYSTEM');
  
  if (useNewWorkflow) {
    return (
      <WorkflowContainer 
        workflowType="lead-creation"
        sourceId={props.sourceId}
        {...props}
      />
    );
  }
  
  return <LegacyLeadCreationFlow {...props} />;
};
```

### Phase 2: Core Component Migration (Week 3-4)

#### 2.1 Create Base Workflow Components

**Priority Order:**
1. WorkflowContainer (main wrapper)
2. WorkflowHeader (stage/step display)
3. WorkflowNavigation (stage/step navigation)
4. WorkflowFooter (action buttons)
5. StepComponentLoader (dynamic step loading)

**Migration Mapping:**

| Legacy Code Section | New Component | Lines Migrated |
|-------------------|---------------|----------------|
| Header rendering (lines 1-50) | WorkflowHeader | ~50 |
| Navigation logic (lines 51-200) | WorkflowNavigation | ~150 |
| Step rendering (lines 201-800) | StepComponentLoader | ~600 |
| Footer actions (lines 801-900) | WorkflowFooter | ~100 |
| State management (lines 901-1364) | Context + Hooks | ~464 |

#### 2.2 Step Component Extraction

**Extract Individual Steps:**

1. **Personal Details Step**
```typescript
// Extract from legacy lines 250-350
// components/steps/PersonalDetailsStep.tsx
```

2. **Business Details Step**
```typescript
// Extract from legacy lines 351-450
// components/steps/BusinessDetailsStep.tsx
```

3. **Financial Details Step**
```typescript
// Extract from legacy lines 451-550
// components/steps/FinancialDetailsStep.tsx
```

4. **Document Upload Step**
```typescript
// Extract from legacy lines 551-650
// components/steps/DocumentUploadStep.tsx
```

5. **Review & Submit Step**
```typescript
// Extract from legacy lines 651-750
// components/steps/ReviewSubmitStep.tsx
```

### Phase 3: State Management Migration (Week 5-6)

#### 3.1 Redux to Context API Migration

**Current Redux State Structure:**
```javascript
// Legacy Redux state
{
  leadCreation: {
    workflow: {},
    currentStep: 0,
    formData: {},
    loading: false,
    errors: {},
    validationErrors: {}
  }
}
```

**New Context State Structure:**
```typescript
// New Context state
{
  workflow: Workflow | null,
  currentStageIndex: number,
  currentStepIndex: number,
  loading: boolean,
  error: string | null,
  formData: Record<string, any>,
  validationErrors: Record<string, string[]>,
  optimisticUpdates: Record<string, any>,
  lastUpdated: number | null
}
```

**Migration Steps:**

1. **Create State Mapping Utility**
```typescript
// utils/stateMigration.ts
export const migrateReduxStateToContext = (reduxState: any) => {
  return {
    workflow: reduxState.leadCreation.workflow,
    currentStageIndex: Math.floor(reduxState.leadCreation.currentStep / 5), // Assuming 5 steps per stage
    currentStepIndex: reduxState.leadCreation.currentStep % 5,
    loading: reduxState.leadCreation.loading,
    error: reduxState.leadCreation.errors.general || null,
    formData: reduxState.leadCreation.formData,
    validationErrors: reduxState.leadCreation.validationErrors,
    optimisticUpdates: {},
    lastUpdated: Date.now()
  };
};
```

2. **Create Redux-Context Bridge**
```typescript
// hooks/useReduxBridge.ts
export const useReduxBridge = () => {
  const reduxState = useSelector(state => state.leadCreation);
  const { dispatch } = useWorkflow();
  
  useEffect(() => {
    if (reduxState.workflow) {
      const contextState = migrateReduxStateToContext({ leadCreation: reduxState });
      dispatch({ type: 'MIGRATE_FROM_REDUX', payload: contextState });
    }
  }, [reduxState, dispatch]);
};
```

#### 3.2 API Integration Migration

**Legacy API Calls (from old component):**
- Workflow build API
- Step execution API
- Form validation API
- File upload API

**New Service Layer Integration:**
```typescript
// services/LeadCreationService.ts
export class LeadCreationService extends WorkflowService {
  constructor() {
    super('lead-creation');
  }
  
  async buildLeadWorkflow(sourceId: string) {
    return this.build({ source_id: sourceId });
  }
  
  async executeLeadStep(sourceId: string, stepData: any) {
    return this.execute(sourceId, stepData);
  }
  
  async validateLeadData(stepId: string, data: any) {
    return this.apiClient.post('/lead/validate', {
      step_id: stepId,
      data
    });
  }
}
```

### Phase 4: Performance Optimization (Week 7-8)

#### 4.1 Implement Performance Monitoring

```typescript
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  startTiming(label: string) {
    performance.mark(`${label}-start`);
  }
  
  endTiming(label: string) {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    this.recordMetric(label, measure.duration);
  }
  
  private recordMetric(label: string, duration: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
  }
  
  getMetrics() {
    const summary = new Map();
    for (const [label, durations] of this.metrics) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      summary.set(label, { avg, max, min, count: durations.length });
    }
    return summary;
  }
}

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  const measureRender = useCallback((componentName: string) => {
    return {
      start: () => monitor.startTiming(`render-${componentName}`),
      end: () => monitor.endTiming(`render-${componentName}`)
    };
  }, [monitor]);
  
  return { measureRender, getMetrics: () => monitor.getMetrics() };
};
```

#### 4.2 Implement Caching Strategy

```typescript
// utils/cacheManager.ts
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100;
  
  set(key: string, data: any, ttl = 300000) { // 5 minutes default
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private evictOldest() {
    const oldest = Array.from(this.cache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0];
    
    if (oldest) {
      this.cache.delete(oldest[0]);
    }
  }
  
  clear() {
    this.cache.clear();
  }
}
```

### Phase 5: Testing & Validation (Week 9-10)

#### 5.1 Automated Testing Strategy

**Unit Tests:**
```typescript
// __tests__/components/workflow/WorkflowContainer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkflowContainer } from '../../../components/workflow/WorkflowContainer';
import { mockWorkflowData } from '../../mocks/workflowData';

describe('WorkflowContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders workflow stages correctly', async () => {
    render(
      <WorkflowContainer 
        workflowType="lead-creation"
        sourceId="test-123"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Personal Details')).toBeInTheDocument();
    });
  });
  
  it('navigates between steps correctly', async () => {
    render(
      <WorkflowContainer 
        workflowType="lead-creation"
        sourceId="test-123"
      />
    );
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Business Details')).toBeInTheDocument();
    });
  });
});
```

**Integration Tests:**
```typescript
// __tests__/integration/LeadCreationFlow.test.tsx
describe('Lead Creation Flow Integration', () => {
  it('completes full lead creation workflow', async () => {
    const onComplete = jest.fn();
    
    render(
      <WorkflowContainer 
        workflowType="lead-creation"
        sourceId="test-123"
        onComplete={onComplete}
      />
    );
    
    // Fill personal details
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    
    // Navigate through all steps
    // ... test implementation
    
    // Verify completion
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(expect.any(Object));
    });
  });
});
```

**Performance Tests:**
```typescript
// __tests__/performance/WorkflowPerformance.test.tsx
describe('Workflow Performance', () => {
  it('renders within performance budget', async () => {
    const startTime = performance.now();
    
    render(
      <WorkflowContainer 
        workflowType="lead-creation"
        sourceId="test-123"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Personal Details')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });
});
```

#### 5.2 A/B Testing Setup

```typescript
// utils/abTesting.ts
export const ABTestManager = {
  getVariant: (testName: string, userId: string) => {
    const hash = simpleHash(`${testName}-${userId}`);
    return hash % 2 === 0 ? 'A' : 'B';
  },
  
  trackEvent: (testName: string, variant: string, event: string, data?: any) => {
    // Send to analytics
    analytics.track('ab_test_event', {
      test_name: testName,
      variant,
      event,
      data
    });
  }
};

// Component usage
export const LeadCreationABTest: React.FC<Props> = (props) => {
  const variant = ABTestManager.getVariant('workflow-migration', props.userId);
  
  useEffect(() => {
    ABTestManager.trackEvent('workflow-migration', variant, 'component_rendered');
  }, [variant]);
  
  if (variant === 'B') {
    return <WorkflowContainer {...props} />;
  }
  
  return <LegacyLeadCreationFlow {...props} />;
};
```

### Phase 6: Deployment & Monitoring (Week 11-12)

#### 6.1 Gradual Rollout Strategy

**Rollout Phases:**

1. **Internal Testing (Week 11)**
   - 100% internal users
   - Monitor performance metrics
   - Collect feedback

2. **Beta Users (Week 12)**
   - 10% of production users
   - A/B test against legacy system
   - Monitor error rates and performance

3. **Gradual Increase**
   - Week 13: 25% of users
   - Week 14: 50% of users
   - Week 15: 75% of users
   - Week 16: 100% of users

**Rollout Configuration:**
```typescript
// config/rollout.ts
export const ROLLOUT_CONFIG = {
  NEW_WORKFLOW_PERCENTAGE: parseInt(process.env.REACT_APP_NEW_WORKFLOW_PERCENTAGE || '0'),
  ROLLOUT_GROUPS: {
    INTERNAL: ['internal', 'admin', 'developer'],
    BETA: ['beta_user'],
    PREMIUM: ['premium', 'enterprise']
  }
};

export const shouldUseNewWorkflow = (user: User) => {
  // Internal users always get new workflow
  if (ROLLOUT_CONFIG.ROLLOUT_GROUPS.INTERNAL.includes(user.role)) {
    return true;
  }
  
  // Beta users get new workflow
  if (ROLLOUT_CONFIG.ROLLOUT_GROUPS.BETA.includes(user.role)) {
    return true;
  }
  
  // Percentage-based rollout for others
  const hash = simpleHash(user.id);
  return (hash % 100) < ROLLOUT_CONFIG.NEW_WORKFLOW_PERCENTAGE;
};
```

#### 6.2 Monitoring & Alerting

**Key Metrics to Monitor:**

1. **Performance Metrics**
   - Initial render time
   - Step transition time
   - Memory usage
   - Bundle size

2. **User Experience Metrics**
   - Completion rate
   - Drop-off points
   - Error rates
   - User satisfaction scores

3. **Technical Metrics**
   - API response times
   - Cache hit rates
   - Error frequency
   - Resource utilization

**Monitoring Implementation:**
```typescript
// utils/monitoring.ts
export const MonitoringService = {
  trackPerformance: (metric: string, value: number, tags?: Record<string, string>) => {
    // Send to monitoring service (DataDog, New Relic, etc.)
    window.gtag?.('event', 'performance_metric', {
      metric_name: metric,
      metric_value: value,
      ...tags
    });
  },
  
  trackError: (error: Error, context?: Record<string, any>) => {
    // Send to error tracking service (Sentry, Bugsnag, etc.)
    console.error('Workflow Error:', error, context);
  },
  
  trackUserAction: (action: string, data?: Record<string, any>) => {
    // Send to analytics service
    window.gtag?.('event', 'user_action', {
      action_name: action,
      ...data
    });
  }
};
```

## Risk Mitigation

### Technical Risks

1. **Performance Regression**
   - **Risk**: New system performs worse than legacy
   - **Mitigation**: Comprehensive performance testing, gradual rollout
   - **Rollback Plan**: Feature flag to instantly revert to legacy system

2. **Data Loss**
   - **Risk**: Form data lost during migration
   - **Mitigation**: State persistence, automatic saving
   - **Rollback Plan**: Data recovery from backup APIs

3. **Integration Issues**
   - **Risk**: API compatibility problems
   - **Mitigation**: Comprehensive integration testing
   - **Rollback Plan**: API versioning and backward compatibility

### Business Risks

1. **User Experience Disruption**
   - **Risk**: Users confused by new interface
   - **Mitigation**: User training, gradual rollout, feedback collection
   - **Rollback Plan**: Quick revert to familiar interface

2. **Conversion Rate Impact**
   - **Risk**: Lower lead conversion rates
   - **Mitigation**: A/B testing, close monitoring of conversion metrics
   - **Rollback Plan**: Immediate rollback if conversion drops significantly

## Success Criteria

### Performance Targets
- [ ] 40% reduction in initial load time
- [ ] 60% reduction in bundle size
- [ ] 50% reduction in memory usage
- [ ] 90% reduction in re-renders

### User Experience Targets
- [ ] Maintain or improve completion rates
- [ ] Reduce user-reported errors by 70%
- [ ] Improve user satisfaction scores by 20%
- [ ] Reduce support tickets related to workflow issues by 50%

### Technical Targets
- [ ] 100% test coverage for new components
- [ ] Zero critical bugs in production
- [ ] 99.9% uptime during migration
- [ ] Successful rollback capability within 5 minutes

## Timeline Summary

| Phase | Duration | Key Deliverables | Success Criteria |
|-------|----------|------------------|------------------|
| 1 | Week 1-2 | Foundation setup, feature flags | Architecture in place, feature flags working |
| 2 | Week 3-4 | Core components | Base workflow components functional |
| 3 | Week 5-6 | State migration | Context API replacing Redux |
| 4 | Week 7-8 | Performance optimization | Performance targets met |
| 5 | Week 9-10 | Testing & validation | 100% test coverage, performance validated |
| 6 | Week 11-12 | Deployment & monitoring | Successful rollout to 100% users |

**Total Duration**: 12 weeks
**Team Size**: 3-4 developers
**Estimated Effort**: 240-320 developer hours

## Post-Migration Tasks

### Immediate (Week 13-14)
- [ ] Remove legacy code and Redux dependencies
- [ ] Update documentation
- [ ] Conduct team retrospective
- [ ] Optimize based on production metrics

### Short-term (Month 2-3)
- [ ] Implement additional workflow types using new architecture
- [ ] Add advanced features (auto-save, offline support)
- [ ] Performance fine-tuning based on real usage data

### Long-term (Month 4-6)
- [ ] Extend architecture to other parts of the application
- [ ] Implement advanced analytics and insights
- [ ] Consider mobile-specific optimizations

This migration strategy provides a comprehensive roadmap for successfully transitioning from the legacy lead creation flow to a modern, performant, and maintainable workflow system.