"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type Property = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  is_published: boolean;
  agent_id: string;
};

export default function MyPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    fetchMyProperties(userData.user.id);
  };

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- need to run only once on mount
  }, []);

  const fetchMyProperties = async (userId: string) => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("agent_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProperties(data);
    }

    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>My Properties</h1>

      {properties.length === 0 && <p>No properties found</p>}

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
          <p>
            <strong>Status:</strong>{" "}
            {property.is_published ? "Published" : "Draft"}
          </p>
        </div>
      ))}
    </div>
  );
}
