import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Truck, FileText, Send, LoaderCircle } from 'lucide-react';

const SweetAlert = ({ show, type, title, message, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className={`p-6 rounded-t-2xl ${type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-center mb-4">
            {type === 'success' ? (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <h3 className={`text-2xl font-bold text-center ${type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-lg font-semibold text-white ${
              type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            } transition-colors`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, error, placeholder, type = 'text', required = true }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
      }`}
    />
    {error && (
      <div className="flex items-center mt-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    )}
  </div>
);

export default function InvoiceApp() {
  const [step, setStep] = useState(1);
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });
  const [formData, setFormData] = useState({
    quantity: '',
    price_after_tax: '',
    sgst_percent: '',
    cgst_percent: '',
    igst_percent: '',
    vehicle_no: '',
    gstin: '',
    is_shipping_same_as_billing: true,
    billing_name: '',
    billing_addr_line1: '',
    billing_addr_line2: '',
    billing_state_code: '',
    shipping_name: '',
    shipping_addr_line1: '',
    shipping_addr_line2: '',
    shipping_state_code: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'quantity':
        return !value ? 'Quantity is required' : value <= 0 ? 'Quantity must be positive' : '';
      case 'price_after_tax':
        return !value ? 'Price is required' : value <= 0 ? 'Price must be positive' : '';
      case 'sgst_percent':
      case 'cgst_percent':
      case 'igst_percent':
        return value === '' ? `${name.split('_')[0].toUpperCase()} is required` : 
               value < 0 || value > 100 ? 'Must be between 0-100' : '';
      case 'vehicle_no':
        return !value ? 'Vehicle number is required' : '';
      case 'billing_name':
        return !value ? 'Name is required' : value.length < 3 ? 'Name too short' : '';
      case 'shipping_name':
        return !formData.is_shipping_same_as_billing ? (!value ? 'Name is required' : value.length < 3 ? 'Name too short' : ''): '';
      case 'billing_addr_line1':
      case 'billing_addr_line2':
      case 'billing_state_code':
        return !value ? 'This field is required' : '';
      case 'shipping_addr_line1':
      case 'shipping_addr_line2':
      case 'shipping_state_code':
        return !value && !formData.is_shipping_same_as_billing ? 'This field is required' : '';
      case 'password':
        return !value ? 'Password is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      ...(name === 'is_shipping_same_as_billing' && newValue ? {
        shipping_name: prev.billing_name,
        shipping_addr_line1: prev.billing_addr_line1,
        shipping_addr_line2: prev.billing_addr_line2,
        shipping_state_code: prev.billing_state_code
      } : {})
    }));
    
    if (type !== 'checkbox') {
      setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'is_shipping_same_as_billing' && key !== 'gstin') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setStep(2);
    } else {
      const errorMessages = Object.values(errors).filter(e => e).join('\n');
      setAlert({
        show: true,
        type: 'error',
        title: 'Validation Error',
        message: errorMessages
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      ...formData,
      quantity: Number(formData.quantity),
      price_after_tax: Number(formData.price_after_tax),
      sgst_percent: Number(formData.sgst_percent),
      cgst_percent: Number(formData.cgst_percent),
      igst_percent: Number(formData.igst_percent)
    };

    try {
      // Replace with your actual API endpoint
      console.log(payload);
      const response = await fetch('https://selfsustainingly-intarsiate-kirsten.ngrok-free.dev/print_invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          title: 'Success!',
          message: 'Invoice submitted successfully!'
        });
        setTimeout(() => {
          setStep(1);
          setFormData({
            quantity: '', price_after_tax: '', sgst_percent: '', cgst_percent: '',
            igst_percent: '', vehicle_no: '', gstin: '', is_shipping_same_as_billing: true,
            billing_name: '', billing_addr_line1: '', billing_addr_line2: '', billing_state_code: '',
            shipping_name: '', shipping_addr_line1: '', shipping_addr_line2: '', shipping_state_code: ''
          });
        }, 2000);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        title: 'Error',
        message: `Failed to submit invoice: ${error.message}`
      });
    }
    finally {
      // setTimeout(() => {
      //   setAlert({ show: false, type: '', title: '', message: '' });
      // }, 3000);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
      
      <SweetAlert {...alert} onClose={() => setAlert({ ...alert, show: false })} />
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Invoice Generator</h1>
                <p className="text-blue-100">Create professional invoices in seconds</p>
              </div>
              <FileText className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                1. Details
              </span>
              <span className={`text-sm font-semibold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                2. Review
              </span>
              <span className={`text-sm font-semibold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                3. Submit
              </span>
            </div>
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                {/* Product Details */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Product Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      error={errors.quantity}
                      placeholder="1250"
                      type="number"
                    />
                    <InputField
                      label="Price After Tax (₹)"
                      name="price_after_tax"
                      value={formData.price_after_tax}
                      onChange={handleChange}
                      error={errors.price_after_tax}
                      placeholder="4.00"
                      type="number"
                    />
                  </div>
                </div>

                {/* Tax Details */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Tax Information</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <InputField
                      label="SGST %"
                      name="sgst_percent"
                      value={formData.sgst_percent}
                      onChange={handleChange}
                      error={errors.sgst_percent}
                      placeholder="6"
                      type="number"
                    />
                    <InputField
                      label="CGST %"
                      name="cgst_percent"
                      value={formData.cgst_percent}
                      onChange={handleChange}
                      error={errors.cgst_percent}
                      placeholder="6"
                      type="number"
                    />
                    <InputField
                      label="IGST %"
                      name="igst_percent"
                      value={formData.igst_percent}
                      onChange={handleChange}
                      error={errors.igst_percent}
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-purple-600" />
                    Shipping Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField
                      label="Vehicle Number"
                      name="vehicle_no"
                      value={formData.vehicle_no}
                      onChange={handleChange}
                      error={errors.vehicle_no}
                      placeholder="OR 16D 8410"
                    />
                    <InputField
                      label="GSTIN"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleChange}
                      error={errors.gstin}
                      placeholder="22AAAAA0000A1Z5 (Optional)"
                      required={false}
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Billing Address</h3>
                  <div className="space-y-4">
                    <InputField
                      label="Business Name"
                      name="billing_name"
                      value={formData.billing_name}
                      onChange={handleChange}
                      error={errors.billing_name}
                      placeholder="ABC Constructions"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputField
                        label="Address Line 1"
                        name="billing_addr_line1"
                        value={formData.billing_addr_line1}
                        onChange={handleChange}
                        error={errors.billing_addr_line1}
                        placeholder="Bisra"
                      />
                      <InputField
                        label="Address Line 2"
                        name="billing_addr_line2"
                        value={formData.billing_addr_line2}
                        onChange={handleChange}
                        error={errors.billing_addr_line2}
                        placeholder="Sundergarh"
                      />
                    </div>
                    <InputField
                      label="State & PIN"
                      name="billing_state_code"
                      value={formData.billing_state_code}
                      onChange={handleChange}
                      error={errors.billing_state_code}
                      placeholder="Odisha, 770036"
                    />
                  </div>
                </div>

                {/* Shipping Same as Billing */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="same_address"
                    name="is_shipping_same_as_billing"
                    checked={formData.is_shipping_same_as_billing}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="same_address" className="text-gray-700 font-medium cursor-pointer">
                    Shipping address is same as billing address
                  </label>
                </div>

                {/* Shipping Address */}
                {!formData.is_shipping_same_as_billing && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h3>
                    <div className="space-y-4">
                      <InputField
                        label="Business Name"
                        name="shipping_name"
                        value={formData.shipping_name}
                        onChange={handleChange}
                        error={errors.shipping_name}
                        placeholder="ABC Const."
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                          label="Address Line 1"
                          name="shipping_addr_line1"
                          value={formData.shipping_addr_line1}
                          onChange={handleChange}
                          error={errors.shipping_addr_line1}
                          placeholder="Bisra"
                        />
                        <InputField
                          label="Address Line 2"
                          name="shipping_addr_line2"
                          value={formData.shipping_addr_line2}
                          onChange={handleChange}
                          error={errors.shipping_addr_line2}
                          placeholder="Sundergarh"
                        />
                      </div>
                      <InputField
                        label="State & PIN"
                        name="shipping_state_code"
                        value={formData.shipping_state_code}
                        onChange={handleChange}
                        error={errors.shipping_state_code}
                        placeholder="Odisha, 770036"
                      />
                    </div>
                  </div>
                )}
                <InputField
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="******"
                />

                <button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Continue to Review →
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Review Invoice Details</h2>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Product Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="font-semibold">Quantity:</span> {formData.quantity}</div>
                      <div><span className="font-semibold">Price After Tax:</span> ₹{formData.price_after_tax}</div>
                      <div><span className="font-semibold">SGST:</span> {formData.sgst_percent}%</div>
                      <div><span className="font-semibold">CGST:</span> {formData.cgst_percent}%</div>
                      <div><span className="font-semibold">IGST:</span> {formData.igst_percent}%</div>
                      <div><span className="font-semibold">Total Amount:</span> ₹{(formData.quantity * formData.price_after_tax).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Shipping Information</h3>
                    <div className="text-sm space-y-1">
                      <div><span className="font-semibold">Vehicle:</span> {formData.vehicle_no}</div>
                      <div><span className="font-semibold">GSTIN:</span> {formData.gstin || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Billing Address</h3>
                    <div className="text-sm">
                      <p className="font-semibold">{formData.billing_name}</p>
                      <p>{formData.billing_addr_line1}</p>
                      <p>{formData.billing_addr_line2}</p>
                      <p>{formData.billing_state_code}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">Shipping Address</h3>
                    <div className="text-sm">
                      <p className="font-semibold">{formData.shipping_name}</p>
                      <p>{formData.shipping_addr_line1}</p>
                      <p>{formData.shipping_addr_line2}</p>
                      <p>{formData.shipping_state_code}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 text-gray-700 py-4 rounded-lg font-bold hover:bg-gray-400 transition-all"
                  >
                    ← Back to Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    {loading ? (
                      <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                    <Send className="w-5 h-5 mr-2" />
                    )}
                    Submit Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Secure & Professional Invoice Management System</p>
        </div>
      </div>
    </div>
  );
}