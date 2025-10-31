import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { Button, Card, Col, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const stepsTemplate = {
  marketing: { status: 'pending' },
  programming: { status: 'pending' },
  technical: { status: 'pending' },
  admin: { status: 'pending' },
  finance: { status: 'pending' },
  final: { status: 'pending' },
}

const NewRequest: React.FC = () => {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [client, setClient] = useState('')
  const navigate = useNavigate()
  const { profile } = useAuth()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const docRef = await addDoc(collection(db, 'requests'), {
        title,
        location,
        client,
        createdBy: profile?.uid,
        currentStep: 'programming',
        status: 'pending',
        steps: { ...stepsTemplate, marketing: { status: 'approved' } },
        createdAt: serverTimestamp(),
        history: [
          { eventType: 'created', department: 'marketing', timestamp: serverTimestamp() },
          { eventType: 'approved', department: 'marketing', timestamp: serverTimestamp() },
        ],
      })
      toast.success('Request created')
      navigate(`/requests/${docRef.id}`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to create request')
    }
  }

  return (
    <Card>
      <ToastContainer />
      <Card.Body>
        <h5 className="mb-3">New OB Request</h5>
        <Form onSubmit={submit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Event Name</Form.Label>
                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control value={location} onChange={(e) => setLocation(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Client</Form.Label>
                <Form.Control value={client} onChange={(e) => setClient(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3">
            <Button type="submit">Create</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  )
}

export default NewRequest
