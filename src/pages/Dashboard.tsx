import React, { useEffect, useState } from 'react'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { Card, Col, Row } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'

const Dashboard: React.FC = () => {
  const [pending, setPending] = useState(0)
  const [approved, setApproved] = useState(0)
  const [rejected, setRejected] = useState(0)
  const { profile } = useAuth()

  useEffect(() => {
    const load = async () => {
      const ref = collection(db, 'requests')
      const p = await getCountFromServer(query(ref, where('status', '==', 'pending')))
      const a = await getCountFromServer(query(ref, where('status', '==', 'approved')))
      const r = await getCountFromServer(query(ref, where('status', '==', 'rejected')))
      setPending(p.data().count)
      setApproved(a.data().count)
      setRejected(r.data().count)
    }
    load()
  }, [])

  return (
    <div>
      <h4 className="mb-3">Welcome{profile ? `, ${profile.displayName || profile.email}` : ''}</h4>
      <Row className="g-3">
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-muted">Pending</div>
              <div className="fs-3 fw-bold">{pending}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-muted">Approved</div>
              <div className="fs-3 fw-bold">{approved}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <div className="text-muted">Rejected</div>
              <div className="fs-3 fw-bold">{rejected}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
