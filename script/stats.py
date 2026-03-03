import os
from collections import defaultdict
from supabase import create_client, Client

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Create client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def fetch_properties():
    response = supabase.table("properties").select(
        "id, title, price, city, is_published"
    ).execute()

    return response.data


def compute_statistics(properties):
    city_data = defaultdict(list)

    for prop in properties:
        if prop["is_published"] and prop["price"]:
            city_data[prop["city"]].append(prop["price"])

    return city_data


def display_statistics(city_data):
    print("\n=== Property Statistics by City ===\n")

    for city, prices in city_data.items():
        count = len(prices)
        avg_price = sum(prices) / count

        print(f"City: {city}")
        print(f"Number of properties: {count}")
        print(f"Average price: {round(avg_price, 2)}")
        print("-" * 30)


if __name__ == "__main__":
    properties = fetch_properties()
    stats = compute_statistics(properties)
    display_statistics(stats)