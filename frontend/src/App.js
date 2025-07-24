import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, Outlet, BrowserRouter} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import InfoPage from "./pages/InfoPage";
import Header from "./components/Header";
import UnloginPage from "./pages/UnloginPage";
import AddBookPage from "./pages/AddBookPage";
import UserProfilePage from "./pages/UserProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import HomePage from "./pages/HomePage";
import BookPage from "./pages/BookPage";
import EditBookPage from "./pages/EditBookPage";
import BooksPage from "./pages/BooksPage";
import OrderPage from "./pages/OrderPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WithdrawPage from "./pages/WithdrawPage";
import TransactionsHistoryPage from "./pages/TransactionsHistoryPage";
import UserManagementPage from "./pages/UserManagementPage";
import BookManagementPage from "./pages/BookManagementPage";


const LayoutWithHeader = () => (
    <>
        <Header/>
        <Outlet/>
    </>
);

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<LayoutWithHeader/>}>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/info" element={<InfoPage/>}/>
                    <Route path="/add-book" element={<AddBookPage/>}/>
                    <Route path="/user/:id" element={<UserProfilePage/>}/>
                    <Route path="/user/:id/edit" element={<EditProfilePage/>}/>
                    <Route path="/book/:id" element={<BookPage/>}/>
                    <Route path="/book/edit/:id" element={<EditBookPage/>}/>
                    <Route path="/books" element={<BooksPage/>}/>
                    <Route path="/order/:bookId" element={<OrderPage/>}/>
                    <Route path="/order/success" element={<OrderSuccessPage/>}/>
                    <Route path="/withdraw" element={<WithdrawPage/>}/>
                    <Route path="/history" element={<TransactionsHistoryPage/>}/>
                    <Route path="/user/:id/history" element={<TransactionsHistoryPage/>}/>
                    <Route path="/user-management" element={<UserManagementPage/>}/>
                    <Route path="/book-management" element={<BookManagementPage/>}/>



                </Route>


                <Route path="/register-success" element={<RegisterSuccessPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
                <Route path="/unlogin" element={<UnloginPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
