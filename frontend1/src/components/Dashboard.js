import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import Tasks from "./Tasks";
import ScheduleOptimizer from "./ScheduleOptimizer";

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}>
      {pathname === "/tasks" ? (
        <Tasks />
      ) : pathname === "/schedule-optimizer" ? (
        <ScheduleOptimizer />
      ) : (
        <Typography>Dashboard content for {pathname}</Typography>
      )}
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function DashboardLayoutNavigationActions(props) {
  const { window } = props;

  const [pathname, setPathname] = React.useState("/tasks");

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null);

  const isPopoverOpen = Boolean(popoverAnchorEl);
  const popoverId = isPopoverOpen ? "simple-popover" : undefined;

  const handlePopoverButtonClick = (event) => {
    event.stopPropagation();
    setPopoverAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (event) => {
    event.stopPropagation();
    setPopoverAnchorEl(null);
  };

  // Remove this const when copying and pasting into your project.
  const demoWindow = window !== undefined ? window() : undefined;

  const popoverMenuAction = (
    <React.Fragment>
      <IconButton
        aria-describedby={popoverId}
        onClick={handlePopoverButtonClick}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id={popoverId}
        open={isPopoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        disableAutoFocus
        disableAutoFocusItem></Menu>
    </React.Fragment>
  );

  return (
    // preview-start
    <AppProvider
      navigation={[
        {
          segment: "tasks",
          title: "Tasks",
          icon: <AssignmentIcon />,
          action: <Chip label={10} color="secondary" size="small" />,
        },

        {
          segment: "schedule-optimizer",
          title: "Schedule Optimizer",
          icon: <EventNoteIcon />,
        },
      ]}
      router={router}
      theme={demoTheme}
      window={demoWindow}>
      <DashboardLayout>
        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
    // preview-end
  );
}

DashboardLayoutNavigationActions.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default DashboardLayoutNavigationActions;
