import { MouseEventHandler } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled, { css } from "styled-components"
import TagDataClass from "../../data/Tag"
import { Modifier, TagType } from "../../data/types"
import { formatCount } from "../../misc/formatting"
import { removeTag, addTag } from "../../redux/actions"
import { selectActiveTags } from "../../redux/selectors"

interface TagNameProps {
  modifier: Modifier
  name: string
  count?: number | null
  types?: TagType[]
}

const modifierToStyle = {
  [Modifier.PLUS]: css``,
  [Modifier.MINUS]: css`
    text-decoration: line-through;
  `,
  [Modifier.OR]: css`
    font-style: italic;
  `,
}

const TagNameSpan = styled.span(
  ({ modifier = Modifier.PLUS }: Pick<TagNameProps, "modifier">) => css`
    ${modifierToStyle[modifier]};
  `
)

export default function TagName(props: TagNameProps) {
  const { modifier, name, count, types = [] } = props
  const text = count ? `${name} (${formatCount(count)})` : name

  const dispatch = useDispatch()
  const activeTags = useSelector(selectActiveTags)

  const toggleTag: MouseEventHandler = (event) => {
    event.stopPropagation()
    const tag = new TagDataClass(name, types, count, modifier)

    if (activeTags[name]) {
      dispatch(removeTag(tag))
    } else {
      dispatch(addTag(tag))
    }
  }

  return (
    <TagNameSpan modifier={modifier} onClick={toggleTag}>
      {text}
    </TagNameSpan>
  )
}
