import {
  type SerializedEditorState,
  type SerializedLexicalNode,
} from '@payloadcms/richtext-lexical/lexical'
import React from 'react'
import Image from 'next/image'

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

    case 'block': {
      const blockNode = node as {
        fields?: {
          blockType?: string
          style?: string
          title?: string
          content?: unknown
          images?: Array<{
            image?: { url?: string; alt?: string; sizes?: { card?: { url?: string } } }
            caption?: string
          }>
          layout?: string
        }
      }
      const fields = blockNode.fields
      if (!fields) return null

      if (fields.blockType === 'tipCallout') {
        const styleMap: Record<string, { bg: string; border: string; icon: string }> = {
          tip: { bg: 'bg-tertiary-fixed/20', border: 'border-tertiary', icon: '💡' },
          note: { bg: 'bg-secondary-container/30', border: 'border-secondary', icon: '📝' },
          warning: { bg: 'bg-red-50', border: 'border-red-400', icon: '⚠️' },
        }
        const style = styleMap[fields.style || 'tip'] || styleMap.tip
        return (
          <div key={index} className={`${style.bg} border-l-4 ${style.border} rounded-r-xl p-5 mb-6`}>
            <p className="font-medium text-on-surface mb-2">
              {style.icon} {fields.title || (fields.style === 'warning' ? 'Warning' : fields.style === 'note' ? 'Note' : "Chef's Tip")}
            </p>
            {fields.content ? <RichText content={fields.content as SerializedEditorState | unknown} /> : null}
          </div>
        )
      }

      if (fields.blockType === 'imageGallery' && fields.images) {
        return (
          <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {fields.images.map((item, imgIdx) => {
              const imgUrl = item.image?.sizes?.card?.url || item.image?.url
              if (!imgUrl) return null
              return (
                <figure key={imgIdx}>
                  <div className="relative aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={imgUrl}
                      alt={item.image?.alt || item.caption || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="text-xs text-on-surface-variant mt-1 text-center">{item.caption}</figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        )
      }

      return null
    }

    case 'horizontalrule':
      return <hr key={index} className="my-8 border-outline-variant/15" />

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
