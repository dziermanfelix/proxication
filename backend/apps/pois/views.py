from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import POI
from .serializers import POISerializer


class POIsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        pois = POI.objects.all()
        serializer = POISerializer(pois, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = POISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class POIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        poi = get_object_or_404(POI, pk=pk)
        serializer = POISerializer(poi)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        poi = get_object_or_404(POI, pk=pk)
        serializer = POISerializer(poi, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        poi = get_object_or_404(POI, pk=pk)
        poi.delete()
        return Response({'msg': 'POI deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)
