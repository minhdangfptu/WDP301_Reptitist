import React, { useState } from 'react';
import { ShoppingCart, Search, User, HelpCircle, Facebook } from 'lucide-react';
import '../css/ShopLandingPage.css';
import Footer from '../components/Footer';
import ProductCategories from './ProductCategories';
const ShopLandingPage = () => {
  return (
    <ProductCategories />
  )
};

export default ShopLandingPage;