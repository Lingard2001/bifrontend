import React from 'react';
import { Drawer, Box, Tooltip, IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, DataObject as DataObjectIcon, TableChart as TableChartIcon } from '@mui/icons-material';

const SIDEBAR_WIDTH_PX = 64;

const MiniSidebar = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const items = [
		{ key: 'dashboard', icon: <HomeIcon />, path: '/', label: 'Dashboard' },
		{ key: 'data-model', icon: <DataObjectIcon />, path: '/data-model', label: 'Data Model' },
		{ key: 'data-view', icon: <TableChartIcon />, path: '/data-view', label: 'Data View' }
	];

	const isActive = (path) => {
		if (path === '/') return location.pathname === '/';
		return location.pathname.startsWith(path);
	};

	return (
		<Drawer
			variant="permanent"
			anchor="left"
			sx={{
				width: SIDEBAR_WIDTH_PX,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: SIDEBAR_WIDTH_PX,
					boxSizing: 'border-box',
					borderRight: '1px solid #e0e0e0',
					position: 'fixed',
					top: '64px', // below AppBar
					height: 'calc(100vh - 64px)',
					backgroundColor: '#fafafa'
				}
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1, gap: 1 }}>
				{items.map((item) => (
					<Tooltip title={item.label} placement="right" key={item.key}>
						<IconButton
							size="large"
							onClick={() => navigate(item.path)}
							sx={{
								color: isActive(item.path) ? '#1976d2' : '#666',
								backgroundColor: isActive(item.path) ? 'rgba(25,118,210,0.1)' : 'transparent',
								'&:hover': { backgroundColor: 'rgba(25,118,210,0.15)' },
								mt: 0.5
							}}
						>
							{item.icon}
						</IconButton>
					</Tooltip>
				))}
			</Box>
		</Drawer>
	);
};

export default MiniSidebar; 