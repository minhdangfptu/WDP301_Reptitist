import { createContext, useContext, useEffect, useState } from "react";
import { countCartItemsService } from "../services/cartService";

const CartContext = createContext();
export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCartCount = async () => {
    setLoading(true);
    try {
      const response = await countCartItemsService();
      setCartCount(response.totalQuantity  || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, loading, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);