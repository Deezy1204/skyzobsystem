import React, { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { Badge, Card, Form, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export interface RequestItem {
  id: string
  title: string
  location: string
  createdBy: string
  currentStep: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: any
}

const RequestsList: React.FC = () => {
  const [items, setItems] = useState<RequestItem[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setItems(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as any
      )
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter((i) => i.status === filter)
  }, [items, filter])

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">OB Requests</h5>
          <Form.Select style={{ width: 220 }} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
        </div>
        <Table hover responsive size="sm">
          <thead>
            <tr>
              <th>Event</th>
              <th>Location</th>
              <th>Created By</th>
              <th>Current Step</th>
              <th>Status</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td>{i.title}</td>
                <td>{i.location}</td>
                <td>{i.createdBy}</td>
                <td className="text-capitalize">{i.currentStep}</td>
                <td>
                  <Badge bg={i.status === 'pending' ? 'warning' : i.status === 'approved' ? 'success' : 'danger'}>
                    {i.status}
                  </Badge>
                </td>
                <td>
                  <Link to={`/requests/${i.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default RequestsList
