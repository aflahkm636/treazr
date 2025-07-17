import { Container, Nav, Navbar } from "react-bootstrap";
import {  Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faHouse, faHeart, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";

function NavBar() {
    return (
        <Navbar expand="lg" className="bg-accent" variant="dark">
            <Container>
                <Navbar.Brand as={Link} to="/" className="text-highlight fw-bold fs-4">
                    Treazr
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link
                            as={NavLink}
                            to="/"
                            className={({ isActive }) =>
                                `text-light d-flex align-items-center px-2 py-1 rounded ${
                                    isActive ? "fw-bold border-bottom border-light text-primary bg-light" : ""
                                }`
                            }
                        >
                            <FontAwesomeIcon icon={faHouse} className="me-2" />
                            Home
                        </Nav.Link>

                        <Nav.Link as={NavLink} to="/products" 
                        className={({ isActive }) =>
                                `text-light d-flex align-items-center px-2 py-1 rounded ${
                                    isActive ? "fw-bold border-bottom border-light text-primary bg-light" : ""
                                }`
                            }>
                            <FontAwesomeIcon icon={faBoxesStacked} className="me-2" />
                            Products
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/wishlist"
                         className={({ isActive }) =>
                                `text-light d-flex align-items-center px-2 py-1 rounded ${
                                    isActive ? "fw-bold border-bottom border-light text-primary bg-light" : ""
                                }`
                            }>
                            <FontAwesomeIcon icon={faHeart} className="me-2" />
                            Wishlist
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/cart" 
                        className={({ isActive }) =>
                                `text-light d-flex align-items-center px-2 py-1 rounded ${
                                    isActive ? "fw-bold border-bottom border-light text-primary bg-light" : ""
                                }`
                            }>
                            <FontAwesomeIcon icon={faCartShopping} className="me-2" />
                            Cart
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
