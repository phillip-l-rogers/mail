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
            {"email": "alice@example.com", "password": "testpass"},
            {"email": "bob@example.com", "password": "testpass"},
            {"email": "charlie@example.com", "password": "testpass"},
        ]
        for u in users:
            if not User.objects.filter(username=u["email"]).exists():
                User.objects.create_user(
                    username=u["email"], email=u["email"], password=u["password"]
                )
        alice = User.objects.get(username="alice@example.com")
        bob = User.objects.get(username="bob@example.com")
        charlie = User.objects.get(username="charlie@example.com")
        self.stdout.write(self.style.SUCCESS("✅ Users created"))
        # Create a dummy email
        for user in (alice, charlie):
            email1 = Email.objects.create(
                user=user,
                sender=alice,
                subject="Welcome to Mail App!",
                body="This is a test email sent from Alice to Charlie.",
                timestamp="2025-07-17 15:00",
            )
            email1.recipients.add(charlie)
            email1.save()
        # Create another dummy email
        for user in (bob, charlie):
            email2 = Email.objects.create(
                user=user,
                sender=bob,
                subject="Welcome to Mail App!",
                body="This is a test email sent from Bob to Charlie.",
                timestamp="2025-07-18 15:00",
            )
            email2.recipients.add(charlie)
            email2.save()
        self.stdout.write(self.style.SUCCESS("Dummy data seeded."))
