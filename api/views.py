from rest_framework.decorators import api_view
from rest_framework.response import Response

# Example view - you can expand this with your models and serializers
@api_view(['GET'])
def api_root(request):
    """API root endpoint"""
    return Response({
        'message': 'Welcome to the Proxication API',
        'endpoints': {
            'health': '/api/health/',
        }
    })


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'ok', 'message': 'API is running'})

