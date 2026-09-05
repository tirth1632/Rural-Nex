from celery import shared_task
from django.utils import timezone
from .models import AnalysisRun, AnalysisJob, JobState, FeasibilityReport

@shared_task(bind=True, max_retries=3)
def generate_feasibility_report_task(self, analysis_run_id):
    try:
        run = AnalysisRun.objects.get(id=analysis_run_id)
        job = run.job
        
        # Helper to update state
        def update_state(state):
            job.current_state = state
            job.save()
            run.status = state
            run.save()

        update_state(JobState.PROCESSING)
        
        # 1. Fetch Location
        update_state(JobState.FETCHING_LOCATION)
        # TODO: call GeocodingProvider
        
        # 2. Fetch POI
        update_state(JobState.FETCHING_POI)
        # TODO: call POIProvider
        
        # 3. Analyze Market
        update_state(JobState.ANALYZING_MARKET)
        # TODO: Compute deterministic market metrics
        
        # 4. Generate AI
        update_state(JobState.GENERATING_AI)
        # TODO: Call LLMService for SWOT, Risks, Pricing
        
        # 5. Compile Report
        update_state(JobState.COMPILING_REPORT)
        # TODO: Save FeasibilityReport
        
        update_state(JobState.COMPLETED)
        run.completed_at = timezone.now()
        run.save()
        
    except Exception as exc:
        update_state(JobState.FAILED)
        if run:
            run.failure_information = str(exc)
            run.completed_at = timezone.now()
            run.save()
        self.retry(exc=exc, countdown=2 ** self.request.retries)
