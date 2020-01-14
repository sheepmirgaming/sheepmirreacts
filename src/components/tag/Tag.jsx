import React, { useState, useEffect } from "react";
import { arrayOf, bool, func, number, object, string } from "prop-types";
import styled from "styled-components";
import "./Tag.css";
import api from "../../misc/api";
import TypeIcon from "../../icons/TypeIcon";
import {
  backgroundColor,
  accentColor,
  borderRadius,
  backgroundColor2,
  spacing,
  borderWidth
} from "../../misc/style";
import { ArrowIcon } from "../../icons/Icons";
import { prettifyTagname } from "./tagUtils";

const dropdownBorderRadius = ({ collapsed }) =>
  collapsed ? borderRadius : `${borderRadius} ${borderRadius} 0 0`;

const switchingColors = ({ active }) => {
  const fg = active ? backgroundColor : accentColor;
  const bg = active ? accentColor : backgroundColor;

  return `
    color: ${fg};
    background-color: ${bg};
    border: ${accentColor} ${borderWidth} solid;
    transition: background-color 0.4s ease-in-out;

    cursor: pointer;

    :hover {
      background-color: ${fg};
      color: ${bg};
      
      i {
        color: ${bg};
      }
    }

    :focus, :active {
      color: ${backgroundColor2};
      border-color: ${backgroundColor2}
    }
  `;
};

export const TagWrapper = styled.div`
  display: inline-block;
  padding: 0.25rem;
  border-radius: ${dropdownBorderRadius}
  font-size: 14px;
  line-height: 1.2;
  vertical-align: baseline;
  margin: ${() => spacing};
  ${switchingColors}
`;

const IconWrapper = styled.span`
  ${({ left }) => (left ? "margin-right: 5px;" : "")}
  ${({ right }) => (right ? "margin-left: 5px;" : "")}
`;

function Tag({
  name,
  count,
  modifier,
  types,
  activeTags,
  loadAliases,
  dispatch
}) {
  const [aliases, setAliases] = useState();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (activeTags.some(t => t.name === name))
      api.getAliases(name).then(newAliases => {
        newAliases.sort((a, b) => Number(b.posts) - Number(a.posts));
        setAliases(
          newAliases.filter(
            alias => !activeTags.some(tag => tag.name === alias.name)
          )
        );
      });
  }, [name, activeTags]);

  const active = activeTags.some(t => t.name === name);
  const showAliases = loadAliases && aliases && aliases.length > 0;

  return (
    <TagWrapper
      active={active}
      collapsed={collapsed}
      onMouseLeave={() => setCollapsed(true)}
      tabIndex="0"
    >
      <TypeIcon types={types} left />
      <TagText
        name={name}
        count={count}
        modifier={modifier}
        types={types}
        activeTags={activeTags}
        dispatch={dispatch}
      />
      {showAliases && (
        <>
          <IconWrapper right onClick={() => setCollapsed(!collapsed)}>
            <ArrowIcon />
          </IconWrapper>
          <div className={"dropdown-list" + (!collapsed ? " visible" : "")}>
            {aliases.map(({ name, posts }) => (
              <Alias
                key={"t_" + name}
                name={name}
                count={posts}
                dispatch={dispatch}
              />
            ))}
          </div>
        </>
      )}
    </TagWrapper>
  );
}

Tag.propTypes = {
  name: string,
  count: number,
  modifier: string,
  types: arrayOf(string),
  active: bool,
  onClick: func
};

Tag.defaultProps = {
  types: [],
  onClick: () => {}
};

function TagText({ name, count, types, modifier, dispatch }) {
  const tagname = prettifyTagname(name);
  const text = count ? `${tagname} (${count})` : tagname;

  return (
    <span
      onClick={() =>
        dispatch({ type: "TOGGLE_TAG", tag: { name, count, types, modifier } })
      }
      onKeyDown={e =>
        e.keyCode === 32 &&
        dispatch({ type: "TOGGLE_TAG", tag: { name, count, types, modifier } })
      }
    >
      {modifier === "-" ? <s>{text}</s> : text}
    </span>
  );
}

function Alias({ name, count, dispatch }) {
  return (
    <div className="alias">
      <TagText name={name} count={count} dispatch={dispatch} />
    </div>
  );
}

TagText.propTypes = {
  name: string.isRequired,
  count: number,
  modifier: string,
  types: arrayOf(string),
  activeTags: arrayOf(object),
  onClick: func
};

TagText.defaultProps = {
  modifier: "+",
  types: [],
  activeTags: [],
  onClick: () => {}
};

export default Tag;
