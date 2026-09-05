from rest_framework import views, status
from rest_framework.response import Response
from .serializers import (
    CalculateRequestSerializer, 
    EMIRequestSerializer, 
    RepaymentRequestSerializer,
    WorkingCapitalRequestSerializer
)
from .services.calculator import FinancialCalculationService
from .services.amortization import EMICalculator, AmortizationService
from .services.working_capital import WorkingCapitalService
from .services.constants import SCHEME_RULES
from .exceptions import FinanceDomainError

class SchemesView(views.APIView):
    def get(self, request):
        return Response(SCHEME_RULES)

class CalculateView(views.APIView):
    def post(self, request):
        serializer = CalculateRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = FinancialCalculationService.calculate(
                    available_margin=serializer.validated_data['available_margin'],
                    desired_project_cost=serializer.validated_data.get('desired_project_cost')
                )
                return Response(result)
            except FinanceDomainError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EMIView(views.APIView):
    def post(self, request):
        serializer = EMIRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                emi = EMICalculator.calculate_emi(
                    principal=serializer.validated_data['principal'],
                    annual_rate=serializer.validated_data['interest_rate'],
                    tenure_months=serializer.validated_data['tenure_months']
                )
                return Response({'emi': emi})
            except FinanceDomainError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RepaymentScheduleView(views.APIView):
    def post(self, request):
        serializer = RepaymentRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                schedule = AmortizationService.generate_schedule(
                    principal=serializer.validated_data['principal'],
                    annual_rate=serializer.validated_data['interest_rate'],
                    tenure=serializer.validated_data['tenure_months'],
                    moratorium=serializer.validated_data['moratorium_months']
                )
                return Response(schedule)
            except FinanceDomainError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkingCapitalView(views.APIView):
    def post(self, request):
        serializer = WorkingCapitalRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                result = WorkingCapitalService.estimate(
                    projected_annual_turnover=serializer.validated_data['projected_annual_turnover'],
                    margin_percentage=serializer.validated_data.get('margin_percentage')
                )
                return Response(result)
            except FinanceDomainError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
