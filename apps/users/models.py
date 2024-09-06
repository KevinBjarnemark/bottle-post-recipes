from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
import datetime

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vegan_mode = models.BooleanField(default=True)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    # Method for tracking/limiting reviews
    def can_review(self):
        if self.last_reviewed_at:
            return datetime.timezone.now() >= self.last_reviewed_at + datetime.timedelta(hours=24)
        return True

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile_and_settings(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
