import type { Metadata } from "next";
import BirthdayBookingPage from "@/components/BirthdayBookingPage";

export const metadata: Metadata = {
  title: "21st Birthday Celebrations | Gasolina",
  description: "Plan your 21st birthday celebration at Gasolina.",
};

export default function TwentyFirstBirthdayPage() {
  return (
    <BirthdayBookingPage
      age="21st"
      formUrl="https://forms.zoopya.com/f/ar2xusadsk"
    />
  );
}
