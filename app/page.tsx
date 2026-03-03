"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  is_published: boolean;
  agent_id: string;
};

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProperties(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) return <p>Loading properties...</p>;

  return (
    <div style={{ padding: 20 }} className="text-black">
      <h1>Published Properties</h1>

      {properties.length === 0 && <p>No properties available</p>}

      {properties.map((property) => (
        <div
          key={property.id}
          style={{
            border: "1px solid #ddd",
            padding: 16,
            marginBottom: 12,
          }}
        >
          <h3>{property.title}</h3>
          <p>{property.description}</p>
          <p>
            <strong>City:</strong> {property.city}
          </p>
          <p>
            <strong>Price:</strong> {property.price} €
          </p>
        </div>
      ))}
    </div>
  );
}
