import {
  type SerializedEditorState,
  type SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

type Props = {
  content: SerializedEditorState | unknown
  className?: string
}

function renderNode(node: SerializedLexicalNode, index: number): React.ReactNode {
  const children = 'children' in node && Array.isArray(node.children)
    ? node.children.map((child: SerializedLexicalNode, i: number) => renderNode(child, i))
    : null

  switch (node.type) {
    case 'root':
      return <>{children}</>

    case 'paragraph':
      return <p key={index} className="mb-4 leading-relaxed text-on-surface-variant">{children}</p>

    case 'heading': {
      const tag = (node as { tag?: string }).tag || 'h2'
      const headingClass = "font-serif text-on-surface mb-3 mt-6"
      if (tag === 'h1') return <h1 key={index} className={headingClass}>{children}</h1>
      if (tag === 'h3') return <h3 key={index} className={headingClass}>{children}</h3>
      if (tag === 'h4') return <h4 key={index} className={headingClass}>{children}</h4>
      if (tag === 'h5') return <h5 key={index} className={headingClass}>{children}</h5>
      if (tag === 'h6') return <h6 key={index} className={headingClass}>{children}</h6>
      return <h2 key={index} className={headingClass}>{children}</h2>
    }

    case 'text': {
      const textNode = node as { text?: string; format?: number }
      let content: React.ReactNode = textNode.text || ''

      // Lexical format bitmask: 1=bold, 2=italic, 4=strikethrough, 8=underline
      const format = textNode.format || 0
      if (format & 1) content = <strong key={`b${index}`}>{content}</strong>
      if (format & 2) content = <em key={`i${index}`}>{content}</em>
      if (format & 8) content = <u key={`u${index}`}>{content}</u>
      if (format & 4) content = <s key={`s${index}`}>{content}</s>

      return <React.Fragment key={index}>{content}</React.Fragment>
    }

    case 'link': {
      const linkNode = node as { fields?: { url?: string }; url?: string }
      const href = linkNode.fields?.url || linkNode.url || '#'
      return (
        <a key={index} href={href} className="text-primary underline hover:text-primary-dark transition-colors">
          {children}
        </a>
      )
    }

    case 'list': {
      const listNode = node as { listType?: string }
      if (listNode.listType === 'number') {
        return <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
      }
      return <ul key={index} className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
    }

    case 'listitem':
      return <li key={index} className="text-on-surface-variant">{children}</li>

    case 'quote':
      return (
        <blockquote key={index} className="border-l-4 border-primary/30 pl-4 italic text-on-surface-variant mb-4">
          {children}
        </blockquote>
      )

    case 'linebreak':
      return <br key={index} />

    default:
      return children ? <div key={index}>{children}</div> : null
  }
}

export function RichText({ content, className }: Props) {
  if (!content) return null

  const editorState = content as SerializedEditorState
  if (!editorState?.root) return null

  return (
    <div className={className}>
      {renderNode(editorState.root, 0)}
    </div>
  )
}
