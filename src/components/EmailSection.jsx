import React, { useRef, useState } from 'react';
import './EmailSection.css';
import EmailEditor from 'react-email-editor';

const EmailEditorSection = () => {
  const emailEditorRef = useRef(null);
  const [subject, setSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [emailData, setEmailData] = useState({
    recipient: 'all',
    subject: '',
    body: '',
    template: 'blank',
    customEmails: '' // ← Add this
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };
  const handleSendEmail = () => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) {
      alert('Editor not ready');
      return;
    }

    unlayer.exportHtml((data) => {
      const { html, design } = data;

      let recipients = [];

      if (emailData.recipient !== 'custom') {
        // Use predefined group
        const selectedGroup = recipientOptions.find(o => o.value === emailData.recipient);
        recipients = selectedGroup ? [`${selectedGroup.count} customers (${selectedGroup.label})`] : [];
      } else {
        // Parse custom emails
        const emails = emailData.customEmails
          .split(/[\n,]+/)
          .map(e => e.trim())
          .filter(e => e.length > 0 && e.includes('@'));
        recipients = emails;
      }

      const finalEmailData = {
        subject: subject || 'Untitled Email',
        recipients: recipients,
        recipientCount: recipients.length,
        recipientType: emailData.recipient === 'custom' ? 'custom' : emailData.recipient,
        htmlContent: html,
        designJson: design,
        templateUsed: selectedTemplate,
        sentAt: new Date().toISOString(),
      };

      console.log('EMAIL READY TO SEND:', finalEmailData);
      alert(`Email prepared for ${finalEmailData.recipientCount} recipient(s)! Check console.`);
    });
  };

  const recipientOptions = [
    { value: 'all', label: 'All Customers', count: 24 },
    { value: 'ordered', label: 'Customers with Orders', count: 10 },
    { value: 'not-ordered', label: 'Customers without Orders', count: 14 },
    { value: 'vip', label: 'VIP Customers', count: 3 },
    { value: 'custom', label: 'Custom Selection', count: 0 }
  ]

  const templates = [
    { id: 'blank', name: 'Blank Template', icon: 'Blank' },
    { id: 'welcome', name: 'Welcome Email', icon: 'Welcome' },
    { id: 'promotion', name: 'Promotion', icon: 'Gift' },
    { id: 'newsletter', name: 'Newsletter', icon: 'Newspaper' },
  ];

  // Load template into editor
  const loadTemplate = (templateId) => {
    const unlayer = emailEditorRef.current?.editor;
    if (!unlayer) return;

    setSelectedTemplate(templateId);

    if (templateId === 'blank') {
      unlayer.loadDesign({ body: { rows: [] } });
      setSubject('');
    } else if (templateId === 'welcome') {
      unlayer.loadDesign({
        body: {
          rows: [
            {
              cells: [1],
              columns: [{
                contents: [
                  { type: 'text', values: { text: '<h1 style="text-align:center;color:#2563eb;">Welcome to Catered by Africa! 👋</h1>' } },
                  { type: 'text', values: { text: '<p style="font-size:16px;text-align:center;">We\'re so excited to have you join our community of food lovers enjoying authentic African cuisine.</p>' } },
                  { type: 'image', values: { src: { url: 'https://via.placeholder.com/600x300/10b981/ffffff?text=Delicious+Meals+Delivered' } } },
                  { type: 'text', values: { text: '<p style="text-align:center;margin-top:20px;">As a welcome gift, enjoy <strong>15% off</strong> your first order with code: <strong>WELCOME15</strong></p>' } },
                  { type: 'button', values: { text: 'Start Ordering →', href: 'https://caterply.com/menu', backgroundColor: '#10b981', color: '#ffffff' } }
                ]
              }]
            }
          ]
        }
      });
      setSubject('Welcome to Catered by Africa! 🎉');
    } else if (templateId === 'promotion') {
      unlayer.loadDesign({
        body: {
          rows: [
            {
              cells: [1],
              columns: [{
                contents: [
                  { type: 'text', values: { text: '<h1 style="text-align:center;color:#f59e0b;">🔥 Special Offer Just for You!</h1>' } },
                  { type: 'text', values: { text: '<h2 style="text-align:center;">Get 20% OFF This Week</h2>' } },
                  { type: 'image', values: { src: { url: 'https://via.placeholder.com/600x400/f59e0b/ffffff?text=Save+Big+Today!' } } },
                  { type: 'text', values: { text: '<p style="text-align:center;font-size:18px;margin:20px 0;">Use code <strong>SAVE20</strong> at checkout</p>' } },
                  { type: 'button', values: { text: 'Claim Offer Now', href: 'https://caterply.com/order', backgroundColor: '#f59e0b', color: '#ffffff' } }
                ]
              }]
            }
          ]
        }
      });
      setSubject('Exclusive: 20% Off Your Next Order!');
    } else if (templateId === 'newsletter') {
      unlayer.loadDesign({
        body: {
          rows: [
            {
              cells: [1],
              columns: [{
                contents: [
                  { type: 'text', values: { text: '<h1 style="text-align:center;color:#7c3aed;">📰 This Week\'s Newsletter</h1>' } },
                  { type: 'text', values: { text: '<p style="text-align:center;">New menu items, customer stories, and more!</p>' } },
                  { type: 'image', values: { src: { url: 'https://via.placeholder.com/600x300/7c3aed/ffffff?text=Featured+Dish+of+the+Week' } } },
                  { type: 'text', values: { text: '<h3>New Arrival: Jollof Rice Deluxe</h3><p>Rich, flavorful, and made with love — now available!</p>' } },
                  { type: 'button', values: { text: 'View Full Menu', href: 'https://caterply.com/menu', backgroundColor: '#7c3aed' } }
                ]
              }]
            }
          ]
        }
      });
      setSubject('This Week at Catered by Africa');
    }
  };



  const onReady = (unlayer) => {
    console.log('Unlayer editor is ready!');
    loadTemplate('blank'); // Start with blank
  };

  return (
    <div className="email-editor-page">
      {/* Header */}
      <div className="email-editor-header">
        <h2>Email Campaign Builder</h2>
        <p>Design and send beautiful emails to  customers</p>
      </div>

      {/* Template Selector */}
      <div className="template-selector">
        <label className="template-label">Choose a starting template:</label>
        <div className="template-grid">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
              onClick={() => loadTemplate(template.id)}
            >
              <div className="template-icon">{template.icon}</div>
              <span className="template-name">{template.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Recipients</label>

        {/* Predefined Recipient Groups */}
        <select
          name="recipient"
          value={emailData.recipient === 'custom' ? 'custom' : emailData.recipient}
          onChange={(e) => {
            const value = e.target.value;
            if (value !== 'custom') {
              setEmailData(prev => ({ ...prev, recipient: value, customEmails: '' }));
            } else {
              setEmailData(prev => ({ ...prev, recipient: 'custom' }));
            }
          }}
          className="form-select"
        >
          {recipientOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
          <option value="custom">Custom List (Enter emails below)</option>
        </select>

        {/* Custom Emails Input – Only shows when "Custom List" is selected */}
        {emailData.recipient === 'custom' && (
          <div className="custom-emails-container" style={{ marginTop: '1rem' }}>
            <textarea
              name="customEmails"
              value={emailData.customEmails || ''}
              onChange={handleInputChange}
              placeholder="Enter email addresses (one per line or comma-separated)&#10;e.g.&#10;john@example.com&#10;mary@domain.com, peter@site.org"
              className="form-textarea"
              rows="6"
            />
            <p className="helper-text">
              {emailData.customEmails
                ? `${emailData.customEmails.split(/[\n,]+/).filter(e => e.trim()).length} email(s) entered`
                : 'No emails entered yet'}
            </p>
          </div>
        )}
      </div>

      {/* Subject Input */}
      <div className="subject-input-group">
        <label>Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter email subject..."
          className="subject-input"
        />
      </div>

      {/* Editor + Actions */}
      <div className="editor-container">
        <div className="editor-actions-bar">
          <button
            className="action-btn"
            onClick={() => emailEditorRef.current?.editor?.exportHtml(data => console.log('Preview HTML:', data.html))}
          >
            Preview HTML
          </button>
          <button className="action-btn" onClick={handleSendEmail}>
            Save Draft
          </button>

          <button className="action-btn" onClick={handleSendEmail}>
            Send Email
          </button>
        </div>

        <div className="unlayer-editor">
          <EmailEditor
            ref={emailEditorRef}
            onReady={onReady}
            style={{ minHeight: '700px', border: '1px solid var(--border-color)' }}
            options={{
              appearance: {
                theme: 'dark', // try 'light' or 'modern_light'
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EmailEditorSection;