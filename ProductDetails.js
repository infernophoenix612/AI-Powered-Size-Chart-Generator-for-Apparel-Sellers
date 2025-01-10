import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Circles } from 'react-loader-spinner';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import dataJSON from '../clothes.json';
function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    // const [recommendation, setRecommendation] = useState('M');
    // const [score, setScore] = useState(94);
    const [category, setCategory] = useState(null); 
    const [selectedRecommendation,setselectedRecommendation]=useState({
        name:"",
        age:"",
        gender:"",
        height:"",
        weight:"",
        chest:"",
        waist:"",
        hips:"",
        bodyShapeIndex:"",
        cupSize:"",
        recommendation:"",
        clothingType:"",
        score:""
    })
    const [recommendationshow,setrecommendationshow]=useState(false);
    const [data, setData] = useState(dataJSON);
    const [savedrecommendation, setsavedrecommendation] = useState([
        
    ]); 
    const [SelectedPerson,setSelectedPerson]=useState("");
    const [orderData, setOrderData] = useState({
        gender:'',
        title: '',
        image: '',
        quantity: 1,
        price: '',
        size:'',
        height: '',
        weight: '',
        chest: '',
        waist: '',
        hips: '',
        cupSize: '',
        bodyShapeIndex: '',
        clothingType: '',
    });
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        chest: '',
        waist: '',
        hips: '',
        cupSize: '',
        bodyShapeIndex: '',
        clothingType: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProductDetails() {
            try {
                // Replace fetch with data from the local JSON file
                const productData = data.find((item) => item.id === parseInt(id)); // Assuming `id` is in your data
                setProduct(productData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setLoading(false);
            }
        }

        fetchProductDetails();
    }, [id, data]);
    useEffect(() => {
        const storedRecommendations = localStorage.getItem('savedrecommendations');
        if (storedRecommendations) {
            setsavedrecommendation(JSON.parse(storedRecommendations));
        }
    }, []);

    // Save to local storage whenever savedrecommendation changes
    useEffect(() => {
        localStorage.setItem('savedrecommendations', JSON.stringify(savedrecommendation));
    }, [savedrecommendation]);
    // useEffect (() => {
    //     localStorage.removeItem('savedrecommendations');
    //     // Optional: clear state as well
    // });
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
  
    const handleImageUpload = async(event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            const fileURL = URL.createObjectURL(file);
            setImagePreview(fileURL);
            const url = 'http://localhost:8000/measurements'; // Corrected endpoint URL
            const formData = new FormData();
            formData.append('image', file); // Use FormData to include the file
        
            setLoading(true); // Set loading to true before making the request
        
            try {
                
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData, // Send FormData object as the body
                });
        
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
        
                const data = await response.json();
                setFormData((prevData) => ({
                    ...prevData,
                    height: (data.height), 
                    waist: (data.waist),
                    chest:(data.chest),
                    hips: (data.hips),
                }));
               
            
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                setLoading(false); 
            }   
      }
    };
    const handleSubmit = async (event) => {
        setrecommendationshow(true);
        event.preventDefault();
        setLoading(true);
        const url = 'http://localhost:5000/upload';
        const formDataToSend = new FormData();
        console.log(formData);
    
        for (const [key, value] of Object.entries(formData)) {
            if (value) {
                formDataToSend.append(key, value);
            }
        }
    
        if (image) {
            formDataToSend.append('image', image);
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formDataToSend,
            });
            const data = await response.json();
            const newRecommendation = {
                name: formData.name,
                age: formData.age,
                gender: formData.gender,
                height: formData.height,
                weight: formData.weight,
                chest: formData.chest,
                waist: formData.waist,
                hips: formData.hips,
                bodyShapeIndex: formData.bodyShapeIndex,
                cupSize: formData.cupSize,
                recommendation: data.Prediction,
                clothingType: formData.clothingType,
                score: data.Accuracy_Percentages,
            };
    
           
            setsavedrecommendation((prevRecommendations) => [
                ...prevRecommendations,
                newRecommendation,
            ]);
           
            setSelectedPerson(formData.name);
            setselectedRecommendation(newRecommendation);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setLoading(false);
        }
    };
    

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleBuyClick = () => {
        const newOrderData = {
            gender:selectedRecommendation.gender,
            title: product.title,
            image: product.image,
            quantity: 1, 
            price: product.price,
            size: selectedRecommendation.recommendation,
            height: selectedRecommendation.height,
            weight: selectedRecommendation.weight,
            chest: selectedRecommendation.chest,
            waist: selectedRecommendation.waist,
            hips: selectedRecommendation.hips,
            cupSize: selectedRecommendation.cupSize,
            bodyShapeIndex: selectedRecommendation.bodyShapeIndex,
            clothingType: selectedRecommendation.clothingType,
        };
        console.log(newOrderData)
        setOrderData(newOrderData);
         
        // Navigate to the checkout page
        navigate('/checkout', { state: { orderData: newOrderData } });
    };
    const [isDropdownVisible, setIsDropdownVisible] = useState(true);

    const handlebuttonclick = () => {
      setIsDropdownVisible(!isDropdownVisible);
    };
    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory); // Set the selected category
        setSelectedPerson(""); // Reset the person selection
        setIsDropdownVisible(true); // Make the dropdown visible
        setrecommendationshow(false);
        setSelectedPerson('');
    };
    const handlePersonSelect = (event) => {
        const personName = event.target.value;
        setSelectedPerson(personName);
        setIsDropdownVisible(false);
        
        // Find the recommendation for the selected person
        const recommendation = savedrecommendation.find((rec) => rec.name === personName);
    
        if (recommendation) {
            console.log("Recommendation found:", recommendation); // Debugging
            setselectedRecommendation(recommendation);
        } else {
            console.log("No recommendation found for:", personName); // Debugging
            // Set default values for all fields
            setselectedRecommendation({
                name: '',
                age: '',
                gender: '',
                height: '',
                weight: '',
                chest: '',
                waist: '',
                hips: '',
                bodyShapeIndex: '',
                cupSize: '',
                recommendation: '',
                clothingType: '',
                score: ''
            });
        }
    
        setrecommendationshow(true);
    };
    
    if (loading) {
        return (
            <div className="h-[70vh] w-full flex justify-center items-center">
                <Circles height={120} width={120} color="#3B82F6" />
            </div>
        );
    }

    if (!product) {
        return <div>Product not found</div>;
    }
    // Function to handle the category change
  

  
    return (
        <div>
            <header className="bg-blue-800 text-white p-4 flex items-center justify-between">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    Flipkart
                </div>

                {/* Search Bar */}
                <div className="flex w-1/2 mx-4">
                    <input
                        type="text"
                        placeholder="Search for products..."
                        className="w-full p-2 rounded-l-md"
                    />
                    <button className="bg-yellow-400 p-2 rounded-r-md flex items-center">
                        <FaSearch className="text-gray-800" />
                    </button>
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-4">
                    <button className="flex items-center">
                        <FaUser className="text-xl" />
                    </button>
                    <button className="flex items-center">
                        <FaShoppingCart className="text-xl" />
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row justify-center items-center p-6 mt-8">
                <div className="w-full lg:w-1/2 flex flex-col items-center rounded-md border-2 border-slate-700">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-64 max-w-md object-cover p-6"
                    />
                    <div className="flex space-x-4 mt-4 mb-4">
                        <button className="bg-bcgClr text-white py-2 px-4 rounded-lg hover:bg-yellow-700">
                            Add to Cart
                        </button>
                        <button onClick={handleBuyClick} className="bg-bcgClr2 text-white py-2 px-4 rounded-lg hover:bg-orange-700">
                            Buy Now
                        </button>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 text-center lg:text-left ml-8 mt-8 lg:mt-0">
                    <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
                    <p className="text-lg text-gray-700 mb-4">{product.description}</p>
                    <p className="text-xl font-semibold mb-4">${product.price}</p>
                    <div className="mt-5 p-4 bg-white shadow rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                    <div className="flex flex-col space-y-1">
                                    {recommendationshow && selectedRecommendation && (
                                        <div className="flex flex-row space-x-4">
                                            <h2 className="text-sm font-medium text-gray-900 uppercase">
                                            {selectedRecommendation.name}
                                            </h2>
                                            <button
                                            type="button"
                                            onClick={handlebuttonclick}
                                            className="text-xs text-green-700 transition duration-150 ease-out hover:ease-in border border-green-700 font-medium rounded-lg px-3 py-1 text-center mb-1 dark:border-green-500 dark:text-green-500"
                                            >
                                            Not <span className='uppercase'>{selectedRecommendation.name}</span>?
                                            </button>
                                        </div>
                                        )}

                                        {/* Dropdown for selecting person */}
                                        {isDropdownVisible && (
                                        <select
                                            className="border border-gray-300 rounded-lg px-3 py-2 mt-2 "
                                            onChange={handlePersonSelect}
                                            value={SelectedPerson}
                                        >
                                            <option value="">Select a person</option>
                                            {category === "top" && (
                                                savedrecommendation
                                                    .filter((person) => person.clothingType === 'topWear') 
                                                    .map((person) => (
                                                        <option key={person.name} value={person.name} className='uppercase text-sm'>
                                                            {person.name}
                                                        </option>
                                                    ))
                                            )}
                                            {category === "bottom" && (
                                                savedrecommendation
                                                    .filter((person) => person.clothingType === 'bottomWear') 
                                                    .map((person) => (
                                                        <option key={person.name} value={person.name} className='uppercase text-sm'>
                                                            {person.name}
                                                        </option>
                                                    ))
                                            )}
                                        </select>
                                        )}
                                        <div className="flex space-x-2 mb-4">
        <button
          className={`py-1 px-2 text-sm font-semibold rounded-md ${category === 'top' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleCategoryChange('top')}
        >
          Top Wear
        </button>
        <button
          className={`py-1 px-2 text-sm font-semibold rounded-md ${category === 'bottom' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleCategoryChange('bottom')}
        >
          Bottom Wear
        </button>
      </div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm font-medium text-gray-700">Size</h3>
                                            {recommendationshow && selectedRecommendation && <div className="bg-green-600 text-white flex items-center space-x-2 rounded-lg px-2 py-1">
                                                <h4 className="text-sm font-semibold">Recommended:</h4>
                                                <p className="text-sm font-semibold">{selectedRecommendation.recommendation}</p>
                                                <p className="text-sm font-semibold">({selectedRecommendation.score}%)</p>
                                            </div>}
                                        </div>
                                    </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white text-sm font-semibold py-1 px-2 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out"
                                    onClick={toggleModal}
                                >
                                    Add Your Measurements
                                </button>
                                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150 ease-in-out">Size guide</a>
                            </div>
                        </div>
                        <fieldset aria-label="Choose a size" className="mt-4">
                            <div className="grid grid-cols-5 gap-4">
                                <label className="group relative has-[:checked]:border-blue-600 flex cursor-pointer hover:border-blue-600 items-center justify-center rounded-md border bg-white px-4 py-3 text-sm font-medium uppercase text-gray-900 shadow-sm  focus:outline-none transition ease-out duration-20">
                                    <input type="radio" name="size-choice" value="XS" className="sr-only " />
                                    <span>XS</span>
                                    <span className="pointer-events-none absolute -inset-px rounded-md" aria-hidden="true"></span>
                                </label>
                                <label className="group relative has-[:checked]:border-blue-600 flex cursor-pointer hover:border-blue-600 items-center justify-center rounded-md border bg-white px-4 py-3 text-sm font-medium uppercase text-gray-900 shadow-sm focus:outline-none transition ease-out duration-20">
                                    <input type="radio" name="size-choice" value="S" className="sr-only" />
                                    <span>S</span>
                                    <span className="pointer-events-none absolute -inset-px rounded-md" aria-hidden="true"></span>
                                </label>
                                <label className="group relative has-[:checked]:border-blue-600 flex cursor-pointer hover:border-blue-600 items-center justify-center rounded-md border bg-white px-4 py-3 text-sm font-medium uppercase text-gray-900 shadow-sm  focus:outline-none transition ease-out duration-20">
                                    <input type="radio" name="size-choice" value="M" className="sr-only" />
                                    <span>M</span>
                                    <span className="pointer-events-none absolute -inset-px rounded-md" aria-hidden="true"></span>
                                </label>
                                <label className="group relative has-[:checked]:border-blue-600 flex cursor-pointer hover:border-blue-600 items-center justify-center rounded-md border bg-white px-4 py-3 text-sm font-medium uppercase text-gray-900 shadow-sm  focus:outline-none transition ease-out duration-20">
                                    <input type="radio" name="size-choice" value="L" className="sr-only" />
                                    <span>L</span>
                                    <span className="pointer-events-none absolute -inset-px rounded-md" aria-hidden="true"></span>
                                </label>
                                <label className="group relative has-[:checked]:border-blue-600 flex cursor-pointer hover:border-blue-600 items-center justify-center rounded-md border bg-white px-4 py-3 text-sm font-medium uppercase text-gray-900 shadow-sm  focus:outline-none transition ease-out duration-20">
                                    <input type="radio" name="size-choice" value="XL" className="sr-only" />
                                    <span>XL</span>
                                    <span className="pointer-events-none absolute -inset-px rounded-md" aria-hidden="true"></span>
                                </label>
                            </div>
                        </fieldset>
                        
                    </div>
                    
                </div>
            </div>

            {isModalOpen && (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-4 rounded-lg w-1/2 ">
        <div className="text-xl font-semibold  w-1/3 rounded-lg border-2 border-blue-600 mb-4"><h1 className='p-1 text-center bg-blue-600 text-white'>Tell Us About Yourself</h1></div>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2">
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2 mt-1"
                    />
                </label>

                <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <label className="w-full md:w-1/2">
                        Age:
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                    <label className="w-full md:w-1/2">
                        Gender:
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                </div>

                <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <label className="w-full md:w-1/2">
                        Height (cm):
                        <input
                            type="number"
                            name="height"
                            value={formData.height}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                    <label className="w-full md:w-1/2">
                        Weight (kg):
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                </div>

                <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <label className="w-full md:w-1/2">
                        Chest (inches):
                        <input
                            type="number"
                            name="chest"
                            value={formData.chest}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                    <label className="w-full md:w-1/2">
                        Waist (inches):
                        <input
                            type="number"
                            name="waist"
                            value={formData.waist}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                </div>

                <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    <label className="w-full md:w-1/2">
                        Hips (inches):
                        <input
                            type="number"
                            name="hips"
                            value={formData.hips}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        />
                    </label>
                    <label className="w-full md:w-1/2">
                        Cup Size (for female):
                        <select
                            name="cupSize"
                            value={formData.cupSize}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        >
                            <option value="">Select cup size</option>
                            <option value="1">AA</option>
                            <option value="2">A</option>
                            <option value="3">B</option>
                            <option value="4">C</option>
                            <option value="5">D</option>
                            <option value="6">DD</option>
                            <option value="7">E</option>
                            <option value="8">F</option>
                        </select>
                    </label>

                </div>

                <div className="flex flex-col md:flex-row mb-4 space-y-4 md:space-y-0 md:space-x-4">
                    {/* Body Shape Index */}
                    <div className="w-full md:w-1/2">
                    <label className="block mb-2">
                        Body Shape Index:
                        <select
                            name="bodyShapeIndex"
                            value={formData.bodyShapeIndex}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2 mt-1"
                        >
                            <option value="">Select body shape</option>
                            <option value="0">0: Standard/Rectangle</option>
                            <option value="1">1: Apple</option>
                            <option value="2">2: Pear</option>
                            <option value="3">3: Hour Glass</option>
                            <option value="4">4: Inverted Triangle</option>
                        </select>
                    </label>
                </div>

                    
                    {/* Clothing Type */}
                    <div className="w-full md:w-1/2">
                        <label className="block mb-2">
                            Clothing Type:
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="clothingType"
                                    value="topWear"
                                    checked={formData.clothingType === 'topWear'}
                                    onChange={handleChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">Top Wear</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="clothingType"
                                    value="bottomWear"
                                    checked={formData.clothingType === 'bottomWear'}
                                    onChange={handleChange}
                                    className="form-radio"
                                />
                                <span className="ml-2">Bottom Wear</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block mb-2">
                        Upload Your Photo:
                    </label>
                    <div className='flex flex-row'>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700"
                    />
                    {image && (
                    <div className='flex flex-row'>
                    <p className='mt-4'>{image.name}</p>
                    <img
                        src={imagePreview}
                        alt="Selected preview"
                        className="w-auto h-16 rounded-lg border-2 border-black"
                    />
                   
                    </div>
                   )}

                   </div>
                </div>

                <div className="mt-2 flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={toggleModal}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                    >
                        Close
                    </button>
                </div>
            </form>
        </div>
    </div>
)}

            </div>
      
    );
}

export default ProductDetail;