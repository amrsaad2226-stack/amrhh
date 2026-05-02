"use client"; // This is a client component
import CheckoutForm from "./CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الانصراف</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
