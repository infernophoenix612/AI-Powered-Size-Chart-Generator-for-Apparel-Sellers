import React, { useState, useEffect } from "react";
import { Circles } from "react-loader-spinner";
import { Link } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa'; // Ensure you have react-icons installed
import dataJSON from '../clothes.json';
function Home() {
    const [data, setData] = useState(dataJSON);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        // Simulate a loading delay
        setLoading(true);
        setData(dataJSON);
        setFilteredData(dataJSON);
        setLoading(false)
        // Cleanup the timer on component unmount
       
    }, []);
    useEffect(() => {
        // Filter data based on search query
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            setFilteredData(data.filter(product =>
                product.title.toLowerCase().includes(lowercasedQuery)
            ));
        } else {
            setFilteredData(data);
        }
    }, [searchQuery, data]);

    return (
        <div>
            {/* Header */}
            <header className="bg-blue-800 text-white p-4 flex items-center justify-between">
                {/* Logo */}
                <div className="text-2xl font-bold">
                    Flipkart
                </div>

                {/* Search Bar */}
                <div className="flex w-1/2 mx-4">
                    <input
                        type="text"
                        placeholder="Search for products, brands and more"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 rounded-l-md outline-none text-black"
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

            {/* Main Content */}
            <div className="mt-4">
                {loading ? (
                    <div className="h-[70vh] w-full flex justify-center items-center">
                        <Circles 
                            height={120}
                            width={120}
                            color={'#3B82F6'}
                        />
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-6 justify-center p-4">
                        {filteredData && filteredData.length ? 
                            filteredData.map((product) => (
                                <Link 
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="w-60 bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center transform transition-transform duration-300 hover:scale-105"
                                >
                                    <img 
                                        src={product.image} 
                                        alt={product.title} 
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                                        <p className="text-gray-600 mb-2">${product.price}</p>
                                    </div>
                                </Link>
                            )) 
                            : <p className="text-center">No products found</p>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
