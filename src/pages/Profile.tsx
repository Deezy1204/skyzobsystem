import React, { useEffect, useState } from 'react'
import { Card, Button, Form, ListGroup } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
// Lazy-load functions to avoid bundling resolution issues
async function callFunction(name: string, data: any) {
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const fn = httpsCallable(getFunctions(), name)
  return fn(data)
}
import { ToastContainer, toast } from 'react-toastify'

const Profile: React.FC = () => {
  const { profile } = useAuth()
  const [pin, setPin] = useState('')
  const [signatures, setSignatures] = useState<any[]>([])
  const [newSignatureName, setNewSignatureName] = useState('')

  const loadSignatures = async () => {
    try {
      const res: any = await callFunction('listSignatures', {})
      setSignatures(res.data?.signatures || [])
    } catch (e: any) {
      toast.error(e.message || 'Failed to load signatures')
    }
  }

  useEffect(() => {
    loadSignatures()
  }, [])

  const updatePin = async () => {
    try {
      await callFunction('setApprovalPin', { pin })
      toast.success('PIN updated')
      setPin('')
    } catch (e: any) {
      toast.error(e.message || 'Failed to update PIN')
    }
  }

  const createSignature = async () => {
    try {
      await callFunction('createSignature', { name: newSignatureName })
      toast.success('Signature created')
      setNewSignatureName('')
      loadSignatures()
    } catch (e: any) {
      toast.error(e.message || 'Failed to create signature')
    }
  }

  return (
    <Card>
      <ToastContainer />
      <Card.Body>
        <h5 className="mb-3">Profile</h5>
        <div className="mb-4 small text-muted">Department: {profile?.department}</div>

        <h6>Approval PIN</h6>
        <div className="d-flex gap-2 align-items-center mb-4">
          <Form.Control type="password" placeholder="New PIN" style={{ maxWidth: 240 }} value={pin} onChange={(e) => setPin(e.target.value)} />
          <Button onClick={updatePin}>Save PIN</Button>
        </div>

        <h6 className="mb-2">Digital Signatures</h6>
        <div className="d-flex gap-2 mb-3">
          <Form.Control placeholder="Signature name" style={{ maxWidth: 300 }} value={newSignatureName} onChange={(e) => setNewSignatureName(e.target.value)} />
          <Button onClick={createSignature}>Create</Button>
          <Button variant="outline-secondary" onClick={loadSignatures}>Refresh</Button>
        </div>
        <ListGroup>
          {signatures.map((s) => (
            <ListGroup.Item key={s.id}>{s.name} <span className="text-muted">({s.id})</span></ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

export default Profile
