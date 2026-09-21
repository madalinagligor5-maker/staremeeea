import type { Metadata } from "next";
import { OnboardingForm } from "@/components/onboarding-form";
export const metadata: Metadata={title:"Pregătim spațiul tău",robots:{index:false}};
export default function OnboardingPage(){return <main className="grid min-h-[100dvh] place-items-center p-4 sm:p-8"><OnboardingForm/></main>}
