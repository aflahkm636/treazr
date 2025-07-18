import React from 'react';
import { CheckCircle } from 'lucide-react';

const features = [
  'Authentic Products',
  'Secure Packaging',
  'Fast Shipping',
  'Rare Finds Weekly',
];

function WhyChooseUs() {
  return (
    <section className="bg-white py-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 text-gray-700">
              <CheckCircle className="text-emerald-500 w-6 h-6" />
              <span className="text-lg font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
