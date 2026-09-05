from django.core.management.base import BaseCommand
from business.models import BusinessCategory

class Command(BaseCommand):
    help = 'Seeds the database with standard business categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Dairy', 'icon_slug': 'dairy', 'description': 'Milk production, collection, and processing.'},
            {'name': 'Agriculture', 'icon_slug': 'agriculture', 'description': 'Crop farming and related activities.'},
            {'name': 'Retail', 'icon_slug': 'retail', 'description': 'Small shops and stalls.'},
            {'name': 'Grocery', 'icon_slug': 'grocery', 'description': 'Kirana stores and food supplies.'},
            {'name': 'Textiles', 'icon_slug': 'textiles', 'description': 'Tailoring and cloth manufacturing.'},
            {'name': 'Food Processing', 'icon_slug': 'food_processing', 'description': 'Pickles, papad, and packaged goods.'},
            {'name': 'Bakery', 'icon_slug': 'bakery', 'description': 'Baked goods and sweets.'},
            {'name': 'Handicrafts', 'icon_slug': 'handicrafts', 'description': 'Local artisanal crafts.'},
            {'name': 'Mobile Repair', 'icon_slug': 'mobile_repair', 'description': 'Electronics and phone servicing.'},
            {'name': 'Electrical Services', 'icon_slug': 'electrical_services', 'description': 'Wiring and repair.'},
            {'name': 'Transportation', 'icon_slug': 'transportation', 'description': 'Goods and passenger transport.'},
            {'name': 'Beauty/Personal Care', 'icon_slug': 'beauty', 'description': 'Salons and cosmetics.'},
            {'name': 'Manufacturing', 'icon_slug': 'manufacturing', 'description': 'Small scale industrial units.'},
            {'name': 'Livestock', 'icon_slug': 'livestock', 'description': 'Poultry, goat rearing, etc.'},
            {'name': 'Other', 'icon_slug': 'other', 'description': 'Miscellaneous businesses.'}
        ]

        count = 0
        for cat_data in categories:
            obj, created = BusinessCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'icon_slug': cat_data['icon_slug'], 'description': cat_data['description']}
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} new categories.'))
