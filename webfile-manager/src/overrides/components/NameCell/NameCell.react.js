import React from 'react';
import Svg from '@opuscapita/react-svg/lib/SVG';
import { getIcon } from '../../../../node_modules/@opuscapita/react-filemanager-connector-node-v1/lib/icons';
import { LoadingCell } from '@opuscapita/react-filemanager'
import { Link } from '@reach/router';

export default (cellProps) => {
  if (!cellProps.rowData.id) {
    return (<LoadingCell />);
  }
  const { svg, fill } = getIcon(cellProps.rowData);

  const path = `/${cellProps.rowData.path}`;

  const data = (
    <div className="oc-fm--name-cell">
      <div className="oc-fm--name-cell__icon">
        <Svg
          className="oc-fm--name-cell__icon-image"
          svg={svg}
          style={{ fill }}
        />
      </div>
      <div
        className="oc-fm--name-cell__title"
        title={cellProps.cellData || ''}
      >
        {cellProps.cellData || ''}
      </div>
    </div>
  );

  if (cellProps.rowData.type === 'file') {
    return data;
  } else {
    return (
      <Link to={path} style={{ textDecoration: 'none', color: 'black' }}>
        { data }
      </Link>
    );
  }
}
