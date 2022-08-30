import { styled, Tab, Tabs } from "@material-ui/core";
import { cssToReactStyleObject, toniqFontStyles } from "@toniq-labs/design-system";

export const StyledTabs = styled((props) => <Tabs {...props} />)({
	background: "linear-gradient(rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.16)) 0 calc(100% - 0px)/100% 1px no-repeat, transparent",
	width: "100%",
	height: "1px",
	'& .MuiTabs-flexContainer': {
		gap: 16,
	},
	'& .MuiTabs-indicator': {
		height: 1,
	},
});

export const StyledTab = styled((props) => <Tab {...props} />)({
	textTransform: "unset",
	minWidth: "min-content",
	maxWidth: "min-content",
	color: "#000000",
	opacity: 0.64,
	...cssToReactStyleObject(toniqFontStyles.paragraphFont),
	'&.Mui-selected': {
		...cssToReactStyleObject(toniqFontStyles.boldParagraphFont),
		color: "#00D093",
		opacity: 1,
	},
	'&.MuiTab-root': {
		padding: 0,
	}
});