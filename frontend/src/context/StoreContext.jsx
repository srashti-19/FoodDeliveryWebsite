import { createContext, useEffect, useState } from "react";
import axios from "axios";

const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const url = "https://food-delivery-website-backend-4zte.onrender.com";

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [food_list, setFoodList] = useState([]);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      setFoodList(response.data.data);
    } catch (error) {
      console.error("Error fetching food list:", error.response?.data || error);
    }
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData);
    } catch (error) {
      console.error("Error loading cart data:", error.response?.data || error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();
      if (token) await loadCartData(token);
    };
    loadData();
  }, [token]);

  const addToCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    if (!token) return;

    try {
      await axios.post(
        `${url}/api/cart/add`,
        { itemId },
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error adding item to cart:", error.response?.data || error);
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId] > 1) {
        updatedCart[itemId] -= 1;
      } else {
        delete updatedCart[itemId];
      }
      return updatedCart;
    });

    if (!token) return;

    try {
      await axios.post(
        `${url}/api/cart/remove`,
        { itemId },
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error removing item from cart:", error.response?.data || error);
    }
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const itemInfo = food_list.find((product) => product._id === itemId);
      return itemInfo ? total + itemInfo.price * quantity : total;
    }, 0);
  };

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContext;

