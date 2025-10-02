import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        <Card className="bg-slate-900/70 border-slate-800 p-5">
          <h1 className="text-2xl md:text-3xl font-bold">Habit details</h1>
          <p className="mt-2 text-slate-300">Habit ID: {id}</p>
          <div className="mt-4">
            <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
