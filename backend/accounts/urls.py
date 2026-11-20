from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, CustomTokenView, RegisterView

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('auth/login/', CustomTokenView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),   # ← NEW
] + router.urls