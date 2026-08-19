import type { Metadata } from "next";
import BirthdayBookingPage from "@/components/BirthdayBookingPage";

export const metadata: Metadata = {
  title: "18th Birthday Celebrations | Gasolina",
  description: "Plan your 18th birthday celebration at Gasolina.",
};

export default function EighteenthBirthdayPage() {
  return (
    <BirthdayBookingPage
      age="18th"
      formUrl="https://forms.zoopya.com/f/qjy9brhkq2"
    />
  );
}
