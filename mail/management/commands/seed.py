# mail/management/commands/seed.py

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from mail.models import Email  # Adjust if your model is named differently

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with dummy users and emails"

    def handle(self, *args, **kwargs):
        # Create users
        user1, _ = User.objects.get_or_create(
            username="alice", email="alice@example.com"
        )
        user1.set_password("testpass")
        user1.save()

        user2, _ = User.objects.get_or_create(username="bob", email="bob@example.com")
        user2.set_password("testpass")
        user2.save()

        user3, _ = User.objects.get_or_create(
            username="test_user", email="test_user@example.com"
        )
        user3.set_password("testpass")
        user3.save()

        # Create a dummy email
        Email.objects.create(
            user=user3,
            sender=user1,
            subject="Welcome to Mail App!",
            body="This is a test email sent from Alice to Test User.",
            timestamp="2025-07-17 15:00",
        ).recipients.add(user3)
        # Create a dummy email
        Email.objects.create(
            user=user3,
            sender=user2,
            subject="Welcome to Mail App!",
            body="This is a test email sent from Bob to Test User.",
            timestamp="2025-07-18 15:00",
        ).recipients.add(user3)

        self.stdout.write(self.style.SUCCESS("Dummy data seeded."))
