# mail/management/commands/seed.py

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from mail.models import Email  # Adjust if your model is named differently

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with dummy users and emails"

    def handle(self, *args, **kwargs):
        # Create users
        users = [
            {"username": "alice", "email": "alice@example.com", "password": "testpass"},
            {"username": "bob", "email": "bob@example.com", "password": "testpass"},
            {
                "username": "charlie",
                "email": "charlie@example.com",
                "password": "testpass",
            },
        ]
        for u in users:
            if not User.objects.filter(username=u["username"]).exists():
                User.objects.create_user(
                    username=u["username"], email=u["email"], password=u["password"]
                )
        alice = User.objects.get(username="alice")
        bob = User.objects.get(username="bob")
        charlie = User.objects.get(username="charlie")
        self.stdout.write(
            self.style.SUCCESS("✅ Users created")
        )  # Create a dummy email
        Email.objects.create(
            user=charlie,
            sender=alice,
            subject="Welcome to Mail App!",
            body="This is a test email sent from Alice to Test User.",
            timestamp="2025-07-17 15:00",
        ).recipients.add(charlie)
        # Create a dummy email
        Email.objects.create(
            user=charlie,
            sender=bob,
            subject="Welcome to Mail App!",
            body="This is a test email sent from Bob to Test User.",
            timestamp="2025-07-18 15:00",
        ).recipients.add(charlie)
        self.stdout.write(self.style.SUCCESS("Dummy data seeded."))
