/**
 * AERT 3.0 Road Intelligence & Hazard Management Screen
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Backed by real backend road_events table & intelligence.py active_road_delay engine:
 * - Real API: getRoadEvents, createRoadEvent, setRoadEventActive, deleteRoadEvent
 * - Visual delay multiplier (+1.8x, etc.) connection to routing latency
 * - Data Honesty: Labeled "Simulated / Seeded Prototype Data"
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Layers,
  MapPin,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import * as api from '../../api';
import { soundManager } from '../../services/soundManager';

export function GeoIntelligenceWorkspace({
  roadEvents: propRoadEvents = [],
  onRefresh = () => {}
}) {
  const [events, setEvents] = useState(propRoadEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New road event form
  const [newForm, setNewForm] = useState({
    type: 'Accident Debris Hazard',
    description: 'Highway obstruction on NH-16 connector',
    corridor: 'NH-16 Srikakulam Bypass',
    road_class: 'National Highway',
    longitude: 83.9045,
    latitude: 18.3045,
    radius_km: 1.0,
    delay_multiplier: 1.5,
    is_active: true
  });

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getRoadEvents();
      if (res && res.road_events) {
        setEvents(res.road_events);
      }
    } catch (err) {
      console.error('Failed to fetch road events:', err);
      setError('Could not reach backend road-events endpoint. Using local state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleToggleActive = async (id, currentActive) => {
    soundManager.playClickTone();
    const nextState = !currentActive;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, is_active: nextState ? 1 : 0 } : e))
    );
    try {
      await api.setRoadEventActive(id, nextState);
      onRefresh();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    soundManager.playWarningBeep();
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      await api.deleteRoadEvent(id);
      onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    soundManager.playClickTone();
    setLoading(true);
    try {
      const created = await api.createRoadEvent(newForm);
      setShowAddForm(false);
      fetchEvents();
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to create road event');
    } finally {
      setLoading(false);
    }
  };

  const activeCount = events.filter((e) => Boolean(e.is_active)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', overflowX: 'hidden' }}>
      {/* Header & Honesty Label */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#ff9500" />
            <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#ff9500' }}>
              ROAD INTELLIGENCE & CORRIDOR DELAYS
            </span>
          </div>
          <button
            onClick={fetchEvents}
            style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer', padding: '2px' }}
            title="Refresh Road Conditions"
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* Honesty Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(255, 149, 0, 0.12)', color: '#ff9500', padding: '1px 6px', borderRadius: '10px', border: '1px solid rgba(255, 149, 0, 0.3)' }}>
            SIMULATED / SEEDED PROTOTYPE DATA
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid #ff9500', borderRadius: '6px', padding: '6px 8px', fontSize: '9px', color: '#ff9500' }}>
          {error}
        </div>
      )}

      {/* Corridor Delay Summary Card */}
      <div style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', fontWeight: 700 }}>
            ACTIVE BOTTLENECKS
          </span>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: activeCount > 0 ? '#ff9500' : '#30d158', fontWeight: 800 }}>
            {activeCount} ACTIVE HAZARDS
          </span>
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#e0e2ea', marginTop: '4px', lineHeight: 1.4 }}>
          Road hazards apply an automated travel-time delay multiplier (1.2x – 2.0x) to nearby dispatch routes.
        </div>
      </div>

      {/* Add Road Event Toggle Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: showAddForm ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 240, 255, 0.12)',
            border: `1px solid ${showAddForm ? 'rgba(255, 255, 255, 0.2)' : '#00f0ff'}`,
            borderRadius: '12px',
            padding: '4px 10px',
            color: showAddForm ? '#9aa8b8' : '#00f0ff',
            fontSize: '9.5px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={12} />
          <span>{showAddForm ? 'Cancel Form' : 'Register Road Condition'}</span>
        </button>
      </div>

      {/* Add Road Event Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} style={{ background: 'rgba(15, 22, 36, 0.95)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
            REGISTER CORRIDOR OBSTRUCTION
          </span>

          <input
            type="text"
            required
            value={newForm.description}
            onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
            placeholder="Obstruction description"
            style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#f2f5f8', fontSize: '10.5px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="text"
              value={newForm.corridor}
              onChange={(e) => setNewForm({ ...newForm, corridor: e.target.value })}
              placeholder="Corridor name"
              style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#f2f5f8', fontSize: '10.5px' }}
            />
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              value={newForm.delay_multiplier}
              onChange={(e) => setNewForm({ ...newForm, delay_multiplier: parseFloat(e.target.value) })}
              placeholder="Delay (e.g. 1.5x)"
              style={{ padding: '6px 8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', color: '#f2f5f8', fontSize: '10.5px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ background: 'linear-gradient(135deg, #ff9500, #ff3b30)', border: 'none', borderRadius: '6px', padding: '6px', color: '#ffffff', fontSize: '10px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, cursor: 'pointer' }}
          >
            Save Hazard
          </button>
        </form>
      )}

      {/* Road Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        {events.map((ev) => {
          const isActive = Boolean(ev.is_active);
          const mult = ev.delay_multiplier || 1.2;

          return (
            <div
              key={ev.id}
              style={{
                background: 'rgba(10, 16, 26, 0.85)',
                border: `1px solid ${isActive ? 'rgba(255, 149, 0, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={13} color={isActive ? '#ff9500' : '#5a6878'} />
                  <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: isActive ? '#f2f5f8' : '#7a8898' }}>
                    {ev.type || 'Hazard'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '8.5px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: isActive ? '#ff9500' : '#7a8898',
                      border: `1px solid ${isActive ? 'rgba(255, 149, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                  >
                    +{mult}x DELAY
                  </span>

                  {/* Toggle Active Button */}
                  <button
                    onClick={() => handleToggleActive(ev.id, isActive)}
                    style={{
                      background: isActive ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isActive ? '#30d158' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '6px',
                      color: isActive ? '#30d158' : '#7a8898',
                      fontSize: '8px',
                      fontFamily: 'JetBrains Mono, monospace',
                      padding: '2px 6px',
                      cursor: 'pointer'
                    }}
                  >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(ev.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer', padding: '2px' }}
                    title="Delete Hazard"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
                {ev.description}
              </div>

              <div style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: '#5a6878' }}>
                {ev.corridor || 'Srikakulam Arterial'} • Radius {ev.radius_km || 1.0} km
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
