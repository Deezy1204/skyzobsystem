import React from 'react'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout } = useAuth()

  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/">Radio OB System</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {profile && (
              <Nav className="me-auto">
                <Nav.Link as={NavLink} to="/">Dashboard</Nav.Link>
                <Nav.Link as={NavLink} to="/requests">Requests</Nav.Link>
                {profile.department === 'marketing' && (
                  <Nav.Link as={NavLink} to="/requests/new">Create Request</Nav.Link>
                )}
                {(profile.role === 'admin' || profile.department === 'systemAdmin') && (
                  <Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>
                )}
              </Nav>
            )}
            <Nav className="ms-auto">
              {profile ? (
                <NavDropdown title={profile.displayName || profile.email} align="end">
                  <NavDropdown.Item as={NavLink} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => logout()}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="py-3" style={{ background: '#F5F6F7', minHeight: 'calc(100vh - 56px)' }}>
        {children}
      </Container>
    </>
  )
}

export default AppLayout
