import React, { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
async function callFunction(name: string, data: any) {
  const { getFunctions, httpsCallable } = await import('firebase/functions')
  const fn = httpsCallable(getFunctions(), name)
  return fn(data)
}
import { ToastContainer, toast } from 'react-toastify'

const DEPT_ORDER = ['marketing', 'programming', 'technical', 'admin', 'finance', 'final'] as const

const RequestFlow: React.FC = () => {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [pin, setPin] = useState('')
  const [signatureRef, setSignatureRef] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const canAct = useMemo(() => {
    if (!profile || !data) return false
    return data.currentStep === profile.department || (profile.role === 'admin' && data.status === 'pending')
  }, [profile, data])

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const snap = await getDoc(doc(db, 'requests', id))
      setData({ id: snap.id, ...(snap.data() || {}) })
      setLoading(false)
    }
    load()
  }, [id])

  const approve = async () => {
    try {
      await callFunction('approveRequest', { requestId: id, signatureRef, pin })
      toast.success('Approved')
      setShowApprove(false)
      // optimistic UI
      const snap = await getDoc(doc(db, 'requests', id!))
      setData({ id: snap.id, ...(snap.data() || {}) })
    } catch (e: any) {
      toast.error(e.message || 'Approval failed')
    }
  }

  const reject = async () => {
    try {
      await callFunction('rejectRequest', { requestId: id, reason: rejectReason })
      toast.success('Rejected')
      setShowReject(false)
      const snap = await getDoc(doc(db, 'requests', id!))
      setData({ id: snap.id, ...(snap.data() || {}) })
    } catch (e: any) {
      toast.error(e.message || 'Rejection failed')
    }
  }

  const saveDeptForm = async (values: any) => {
    if (!id || !profile) return
    const path = `steps.${profile.department}.form`
    await updateDoc(doc(db, 'requests', id), {
      [path]: values,
    } as any)
    toast.success('Saved')
  }

  if (loading) return <div>Loading...</div>
  if (!data) return <div>Not found</div>

  return (
    <Row className="g-3">
      <ToastContainer />
      <Col md={3}>
        <Card>
          <Card.Body>
            <h6 className="mb-3">Progress</h6>
            <ListGroup variant="flush">
              {DEPT_ORDER.map((d) => (
                <ListGroup.Item key={d} className="d-flex align-items-center justify-content-between">
                  <span className="text-capitalize">{d}</span>
                  <Badge bg={data.steps?.[d]?.status === 'approved' ? 'success' : data.steps?.[d]?.status === 'rejected' ? 'danger' : 'secondary'}>
                    {data.steps?.[d]?.status || 'pending'}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>
      <Col md={9}>
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-1">{data.title}</h5>
                <div className="text-muted">{data.location}</div>
              </div>
              <Badge bg={data.status === 'pending' ? 'warning' : data.status === 'approved' ? 'success' : 'danger'} className="text-uppercase">
                {data.status}
              </Badge>
            </div>

            <div className="mb-3">
              <strong>Current Step: </strong>
              <span className="text-capitalize">{data.currentStep}</span>
            </div>

            {canAct && (
              <div className="d-flex gap-2 mb-3">
                <Button onClick={() => setShowApprove(true)}>Approve</Button>
                <Button variant="outline-danger" onClick={() => setShowReject(true)}>Reject</Button>
              </div>
            )}

            {/* Department form placeholder */}
            <DeptForm
              values={data.steps?.[profile?.department || '']?.form || {}}
              onSave={saveDeptForm}
              readOnly={!canAct}
            />

            <div className="mt-3">
              <Link to="/requests">Back to list</Link>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Modal show={showApprove} onHide={() => setShowApprove(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve with Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Signature Reference</Form.Label>
              <Form.Control value={signatureRef} onChange={(e) => setSignatureRef(e.target.value)} placeholder="Signwell signature ID" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Approval PIN</Form.Label>
              <Form.Control type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprove(false)}>Cancel</Button>
          <Button onClick={approve}>Approve</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showReject} onHide={() => setShowReject(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <Form.Control as="textarea" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReject(false)}>Cancel</Button>
          <Button variant="danger" onClick={reject}>Reject</Button>
        </Modal.Footer>
      </Modal>
    </Row>
  )
}

const DeptForm: React.FC<{ values: any; onSave: (v: any) => void; readOnly?: boolean }> = ({ values, onSave, readOnly }) => {
  const [equipment, setEquipment] = useState(values.equipment || '')
  const [crew, setCrew] = useState(values.crew || '')
  const [notes, setNotes] = useState(values.notes || '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ equipment, crew, notes })
  }

  return (
    <Form onSubmit={submit}>
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Equipment</Form.Label>
            <Form.Control value={equipment} onChange={(e) => setEquipment(e.target.value)} disabled={readOnly} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Crew</Form.Label>
            <Form.Control value={crew} onChange={(e) => setCrew(e.target.value)} disabled={readOnly} />
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={readOnly} />
          </Form.Group>
        </Col>
      </Row>
      {!readOnly && (
        <div className="mt-3">
          <Button type="submit">Save</Button>
        </div>
      )}
    </Form>
  )
}

export default RequestFlow
