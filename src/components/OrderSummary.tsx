import React from 'react';
import { BookingData } from '../types';
import { Check, Loader2 } from 'lucide-react';

interface OrderSummaryProps {
  bookingData: BookingData;
  onSubmit: () => void;
}

export function OrderSummary({ bookingData, onSubmit }: OrderSummaryProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const { religion, selectedKitItems, selectedServices, personalInfo } = bookingData;
  
  const kitTotal = selectedKitItems.reduce((sum, item) => sum + item.price, 0);
  const servicesTotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const grandTotal = kitTotal + servicesTotal;

  const handleSubmit = async () => {
    // Frontend validation before sending request
    if (!personalInfo.name.trim()) {
      setSubmitError('Name is required');
      return;
    }
    if (!personalInfo.email.trim()) {
      setSubmitError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    if (!personalInfo.address.trim()) {
      setSubmitError('Address is required');
      return;
    }
    if (!personalInfo.phone.trim()) {
      setSubmitError('Phone number is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/submit-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        // Handle HTTP errors
        let errorMessage = 'Failed to submit booking';
        try {
          const errorResult = await response.json();
          errorMessage = errorResult.message || errorMessage;
        } catch (parseError) {
          // If we can't parse the error response, use a generic message
          errorMessage = `Server error (${response.status})`;
        }
        setSubmitError(errorMessage);
        return;
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        setSubmitError('Invalid response from server. Please try again.');
        return;
      }

      if (result.success) {
        onSubmit();
      } else {
        setSubmitError(result.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setSubmitError('Cannot connect to server. Please ensure the backend is running and try again.');
      } else {
        setSubmitError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Summary</h2>
        <p className="text-gray-600">Review your selection before submitting</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Personal Information */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{personalInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{personalInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{personalInfo.phone}</p>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold">{personalInfo.address}</p>
            </div>
          </div>
        </div>

        {/* Religion */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Selected Religion</h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{religion?.icon}</span>
            <span className="text-lg font-medium">{religion?.name}</span>
          </div>
        </div>

        {/* Kit Items */}
        {selectedKitItems.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Kit Items</h3>
            <div className="space-y-3">
              {selectedKitItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Check size={16} className="text-green-500" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">₹{item.price}</p>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Kit Subtotal</p>
                  <p className="font-semibold text-blue-600">₹{kitTotal}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {selectedServices.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Services</h3>
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Check size={16} className="text-green-500" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      {service.duration && (
                        <p className="text-xs text-gray-500">Duration: {service.duration}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">₹{service.price}</p>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Services Subtotal</p>
                  <p className="font-semibold text-green-600">₹{servicesTotal}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-900">Grand Total</p>
              <p className="text-sm text-gray-600">All items and services included</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">₹{grandTotal}</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6">
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-3 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>
          <p className="text-center text-sm text-gray-600 mt-3">
            Your booking will be submitted and you'll receive a confirmation shortly
          </p>
        </div>
      </div>
    </div>
  );
}