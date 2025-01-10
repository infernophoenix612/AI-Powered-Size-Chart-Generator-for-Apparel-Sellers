import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = () => {
  const location = useLocation();
  const orderData = location.state || {};
  console.log(orderData)
  const [Purchasedata, setPurchasedata] = useState({
    gender:orderData.orderData.gender,
    title: orderData.orderData.title,
    image: orderData.orderData.image,
    quantity: 1, // Default to 1 or you can make it dynamic based on user input
    price: orderData.orderData.price,
    size: orderData.orderData.size,
    height: orderData.orderData.height,
    weight: orderData.orderData.weight,
    chest: orderData.orderData.chest,
    waist: orderData.orderData.waist,
    hips: orderData.orderData.hips,
    cupSize: orderData.orderData.cupSize,
    bodyShapeIndex: orderData.orderData.bodyShapeIndex,
    clothingType: orderData.orderData.clothingType,
    feedback: '',
    feedbackOptions: {
      loose: false,
      fit: false,
      tight: false,
    },
  });
  const [shippingInfo, setShippingInfo] = useState({
    name: 'shivansh',
    address: 'iit roorkee',
    city: 'roorkee',
    state: 'uttrakhand',
    zip: '246674',
    country: 'INDIA'
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '1252',
    cardName: '554',
    expirationDate: '5454',
    cvv: '542'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackOptions, setFeedbackOptions] = useState({
    loose: false,
    fit: false,
    tight: false
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prevInfo) => ({ ...prevInfo, [name]: value }));
  };

  const handleFeedbackOptionChange = (e) => {
    const { name, checked } = e.target;
    setFeedbackOptions((prevOptions) => {
      const updatedOptions = { ...prevOptions, [name]: checked };
      setPurchasedata((prevData) => ({
        ...prevData,
        feedbackOptions: updatedOptions,
      }));
      return updatedOptions;
    });
  };

console.log(feedbackOptions)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Shipping Info:', shippingInfo);
    console.log('Payment Info:', paymentInfo);
    
    // Prepare the data to send
      toast.success('Order Placed!');
      setIsModalOpen(true);
      
  };
  const handleFeedbackSubmit = async() => {
    // Handle the feedback submission (e.g., send to server)
     try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Purchasedata)
      });
      setIsModalOpen(false);
    }catch (error) {
      toast.error('An error occurred while placing the order');
      console.error('Error:', error);
    }
  };
  console.log(Purchasedata)
  return (
    <div>
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 flex items-center justify-between">
        <div className="text-2xl font-bold">
          Flipkart
        </div>
        <div className="flex w-1/2 mx-4">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full p-2 rounded-l-md border border-gray-300"
          />
          <button className="bg-yellow-400 p-2 rounded-r-md flex items-center">
            <FaSearch className="text-gray-800" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center">
            <FaUser className="text-xl" />
          </button>
          <button className="flex items-center">
            <FaShoppingCart className="text-xl" />
          </button>
        </div>
      </header>

      {/* Checkout Page Content */}
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={handleSubmit}>
          {/* Shipping Information */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                value={shippingInfo.name}
                onChange={handleShippingChange}
                placeholder="Full Name"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleShippingChange}
                placeholder="Address"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="city"
                value={shippingInfo.city}
                onChange={handleShippingChange}
                placeholder="City"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="state"
                value={shippingInfo.state}
                onChange={handleShippingChange}
                placeholder="State"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="zip"
                value={shippingInfo.zip}
                onChange={handleShippingChange}
                placeholder="ZIP Code"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingChange}
                placeholder="Country"
                className="p-2 border rounded"
                required
              />
            </div>
          </section>

          {/* Payment Information */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                placeholder="Card Number"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="cardName"
                value={paymentInfo.cardName}
                onChange={handlePaymentChange}
                placeholder="Cardholder's Name"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="expirationDate"
                value={paymentInfo.expirationDate}
                onChange={handlePaymentChange}
                placeholder="Expiration Date (MM/YY)"
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                name="cvv"
                value={paymentInfo.cvv}
                onChange={handlePaymentChange}
                placeholder="CVV"
                className="p-2 border rounded"
                required
              />
            </div>
          </section>

          {/* Order Summary */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="border-t border-gray-200">
              <div className="py-2 border-b border-gray-200 flex items-center">
                <img
                  src={orderData.orderData.image}
                  alt={orderData.orderData.title}
                  className="w-16 h-16 object-cover mr-4"
                />
                <div className="flex justify-between w-full">
                  <span>{orderData.orderData.title} (x{orderData.orderData.quantity}) - Size: {orderData.orderData.size}</span>
                  <span>${orderData.orderData.price * orderData.orderData.quantity}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold py-2">
                <span>Total</span>
                <span>${orderData.orderData.price * orderData.orderData.quantity}</span>
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Complete Purchase
          </button>
        </form>
      </div>

      {/* Feedback Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Feedback Modal"
        className="max-w-lg p-8 bg-white shadow-lg rounded-lg mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4">Order Feedback</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How was your experience?"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Recommended Size:</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="loose"
                checked={feedbackOptions.loose}
                onChange={handleFeedbackOptionChange}
                className="mr-2"
              />
              Loose
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="fit"
                checked={feedbackOptions.fit}
                onChange={handleFeedbackOptionChange}
                className="mr-2"
              />
              Perfect Fit
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="tight"
                checked={feedbackOptions.tight}
                onChange={handleFeedbackOptionChange}
                className="mr-2"
              />
              Tight
            </label>
          </div>
        </div>
        <button
          onClick={handleFeedbackSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Submit Feedback
        </button>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default CheckoutPage;
