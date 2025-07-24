import React from "react";
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaPiggyBank } from "react-icons/fa";
import { RiVisaLine, RiMastercardLine } from "react-icons/ri";
import { SiPaytm, SiGooglepay, SiPhonepe } from "react-icons/si";

const PaymentMethods = ({
  paymentMethod,
  setPaymentMethod,
  cardType,
  setCardType,
  upiProvider,
  setUpiProvider
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <FaCreditCard className="text-indigo-600 mr-3 text-xl" />
        <h2 className="text-xl font-serif font-semibold text-gray-800">Payment Method</h2>
      </div>

      <div className="space-y-4">
        {/* Cash on Delivery */}
        <div
          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
            paymentMethod === "cod"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          onClick={() => setPaymentMethod("cod")}
        >
          <div className="flex items-start">
            <input
              type="radio"
              className="mt-1 mr-3 form-radio text-indigo-600"
              checked={paymentMethod === "cod"}
              readOnly
            />
            <div className="flex-1">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-green-500 mr-2 text-lg" />
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pay when you receive your order. $5 convenience fee applies.
              </p>
            </div>
          </div>
        </div>

        {/* Credit/Debit Card */}
        <div
          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
            paymentMethod === "card"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          onClick={() => setPaymentMethod("card")}
        >
          <div className="flex items-start">
            <input
              type="radio"
              className="mt-1 mr-3 form-radio text-indigo-600"
              checked={paymentMethod === "card"}
              readOnly
            />
            <div className="flex-1">
              <div className="flex items-center">
                <FaCreditCard className="text-blue-500 mr-2 text-lg" />
                <span className="font-medium">Credit/Debit Card</span>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cardType"
                        value="credit"
                        checked={cardType === "credit"}
                        onChange={(e) => setCardType(e.target.value)}
                        className="text-indigo-600"
                      />
                      <div className="flex items-center">
                        <RiVisaLine className="text-blue-800 text-xl mr-1" />
                        <RiMastercardLine className="text-red-500 text-xl mr-2" />
                        Credit Card
                      </div>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="cardType"
                        value="debit"
                        checked={cardType === "debit"}
                        onChange={(e) => setCardType(e.target.value)}
                        className="text-indigo-600"
                      />
                      Debit Card
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UPI Payment */}
        <div
          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
            paymentMethod === "upi"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          onClick={() => setPaymentMethod("upi")}
        >
          <div className="flex items-start">
            <input
              type="radio"
              className="mt-1 mr-3 form-radio text-indigo-600"
              checked={paymentMethod === "upi"}
              readOnly
            />
            <div className="flex-1">
              <div className="flex items-center">
                <FaMobileAlt className="text-purple-500 mr-2 text-lg" />
                <span className="font-medium">UPI Payment</span>
              </div>

              {paymentMethod === "upi" && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        upiProvider === "googlepay"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => setUpiProvider("googlepay")}
                    >
                      <SiGooglepay className="text-blue-600 text-lg" />
                      Google Pay
                    </button>
                    <button
                      type="button"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        upiProvider === "paytm"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => setUpiProvider("paytm")}
                    >
                      <SiPaytm className="text-blue-500 text-lg" />
                      Paytm
                    </button>
                    <button
                      type="button"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        upiProvider === "phonepe"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => setUpiProvider("phonepe")}
                    >
                      <SiPhonepe className="text-purple-600 text-lg" />
                      PhonePe
                    </button>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="name@upi"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Net Banking */}
        <div
          className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
            paymentMethod === "netbanking"
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300"
          }`}
          onClick={() => setPaymentMethod("netbanking")}
        >
          <div className="flex items-start">
            <input
              type="radio"
              className="mt-1 mr-3 form-radio text-indigo-600"
              checked={paymentMethod === "netbanking"}
              readOnly
            />
            <div className="flex-1">
              <div className="flex items-center">
                <FaPiggyBank className="text-green-600 mr-2 text-lg" />
                <span className="font-medium">Net Banking</span>
              </div>

              {paymentMethod === "netbanking" && (
                <div className="mt-4">
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;