from django.conf import settings
from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db.models.signals import post_save
import datetime
from cloudinary.models import CloudinaryField
from django.utils import timezone


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vegan_mode = models.BooleanField(default=True)
    if settings.DEBUG:
        image = models.ImageField(
            upload_to='profile_images/', blank=True, null=True
        )
    else:
        image = CloudinaryField('image', blank=True, null=True)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    review_recipe_id = models.IntegerField(null=True, blank=True)

    # Method for tracking/limiting reviews
    def can_review(self):
        # If user haven't reviewed ever, return True
        if self.last_reviewed_at is None:
            return True
        # Calculate hours if they have reviewed before
        elif self.last_reviewed_at:
            now = timezone.now()
            # Calculate if a day has passed since their last review
            a_day_has_passed = (
                now >= self.last_reviewed_at + datetime.timedelta(hours=24)
            )
            return a_day_has_passed
        # Prevent unknown conditions to pass through
        return False


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile_and_settings(sender, instance, **kwargs):
    instance.profile.save()


post_save.connect(create_user_profile, sender=User)
