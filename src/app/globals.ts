import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";

@Injectable()
export class Globals {
  headers = new HttpHeaders().append(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );

  GC_USER_ID = "graphcool-user-id";
  GC_AUTH_TOKEN = "graphcool-auth-token";
  GC_USER_EMAIL = "graphcool-user-email";
  GC_USERNAME = "graphcool-username";

  pageLimit = 12;
  pageStart = 0;

  MENUITEMS = [
    {
      headTitle: "General",
    },
    {
      title: "Dashboard",
      icon: "icon-desktop",
      type: "sub",
      active: false,
      children: [
        { path: "/dashboard/default", title: "Default", type: "link" },
        {
          path: "/dashboard/ecommerce",
          title: "E-Commerce",
          type: "link",
          badgeType: "danger",
          badgeValue: "Hot",
        },
        { path: "/dashboard/business", title: "Business", type: "link" },
        { path: "/dashboard/crm", title: "CRM", type: "link" },
      ],
    },
    {
      title: "Widgets",
      icon: "icon-blackboard",
      type: "sub",
      active: false,
      children: [
        { path: "/widgets/general", title: "General widget", type: "link" },
        { path: "/widgets/chart", title: "Chart widget", type: "link" },
      ],
    },
    {
      headTitle: "Components",
    },
    {
      title: "Base",
      icon: "icon-package",
      type: "sub",
      active: false,
      children: [
        {
          title: "UI-Elements",
          type: "sub",
          children: [
            { path: "/base/grid", title: "Grid", type: "link" },
            {
              path: "/base/helper-class",
              title: "Helper Classes",
              type: "link",
            },
            { path: "/base/list", title: "List", type: "link" },
            { path: "/base/navs", title: "Navs", type: "link" },
            { path: "/base/progressbar", title: "Progresssbar", type: "link" },
            { path: "/base/shadow", title: "Shadow", type: "link" },
            { path: "/base/spinners", title: "Spinners", type: "link" },
            { path: "/base/state-color", title: "State Color", type: "link" },
            { path: "/base/tag-n-pills", title: "Tag & pills", type: "link" },
            { path: "/base/typography", title: "Typography", type: "link" },
          ],
        },
        {
          title: "Ng-Bootstrap",
          type: "sub",
          active: false,
          children: [
            { path: "/base/ngb/accordion", title: "Accordion", type: "link" },
            { path: "/base/ngb/alert", title: "Alert", type: "link" },
            { path: "/base/ngb/buttons", title: "Buttons", type: "link" },
            { path: "/base/ngb/carousel", title: "Carousel", type: "link" },
            { path: "/base/ngb/collapse", title: "Collapse", type: "link" },
            { path: "/base/ngb/datepicker", title: "Datepicker", type: "link" },
            { path: "/base/ngb/dropdown", title: "Dropdown", type: "link" },
            { path: "/base/ngb/modal", title: "Modal", type: "link" },
            { path: "/base/ngb/pagination", title: "Pagination", type: "link" },
            { path: "/base/ngb/popover", title: "Popover", type: "link" },
            {
              path: "/base/ngb/progressbar",
              title: "Progressbar",
              type: "link",
            },
            { path: "/base/ngb/rating", title: "Rating", type: "link" },
            { path: "/base/ngb/tabset", title: "Tabset", type: "link" },
            { path: "/base/ngb/timepicker", title: "Timepicker", type: "link" },
            { path: "/base/ngb/tooltip", title: "Tooltip", type: "link" },
            { path: "/base/ngb/typeahead", title: "Typeahead", type: "link" },
          ],
        },
      ],
    },
    {
      title: "Advance",
      icon: "icon-support",
      type: "sub",
      active: false,
      children: [
        { path: "/advance/scrollable", title: "Scrollable", type: "link" },
        { path: "/advance/toastr", title: "Ngx Toastr", type: "link" },
        { path: "/advance/sweetalert", title: "SweetAlert", type: "link" },
        { path: "/advance/owl-carousel", title: "Owl Carousel", type: "link" },
        { path: "/advance/ribbons", title: "Ribbons", type: "link" },
        { path: "/advance/steps", title: "Steps", type: "link" },
        { path: "/advance/breadcrumb", title: "Breadcrumb", type: "link" },
        { path: "/advance/range-slider", title: "Range Slider", type: "link" },
        { path: "/advance/sticky", title: "Sticky", type: "link" },
      ],
    },
    {
      title: "Icons",
      icon: "icon-crown",
      type: "sub",
      active: false,
      children: [
        { path: "/icons/flag", title: "Flag icon", type: "link" },
        { path: "/icons/fontawesome", title: "Fontawesome Icon", type: "link" },
        { path: "/icons/ico", title: "Ico Icon", type: "link" },
        { path: "/icons/themify", title: "Themify Icon", type: "link" },
        { path: "/icons/whether", title: "Whether Icon", type: "link" },
      ],
    },
    {
      title: "Buttons",
      icon: "icon-crown",
      type: "sub",
      active: false,
      children: [
        { path: "/buttons/default", title: "Default Style", type: "link" },
        { path: "/buttons/flat", title: "Flat Style", type: "link" },
        { path: "/buttons/edge", title: "Edge Style", type: "link" },
        { path: "/buttons/raised", title: "Raised Style", type: "link" },
        { path: "/buttons/group", title: "Button Group", type: "link" },
      ],
    },
    {
      title: "Forms",
      icon: "icon-notepad",
      type: "sub",
      active: false,
      children: [
        {
          title: "Form Controls",
          type: "sub",
          children: [
            {
              path: "/form/validation",
              title: "Form Validation",
              type: "link",
            },
            { path: "/form/inputs", title: "Base Inputs", type: "link" },
            {
              path: "/form/checkbox-radio",
              title: "Checkbox & Radio",
              type: "link",
            },
            { path: "/form/input-groups", title: "Input Groups", type: "link" },
            { path: "/form/mega-options", title: "Mega Options", type: "link" },
          ],
        },
        {
          path: "/form/defualt",
          title: "Default Forms",
          active: false,
          type: "link",
        },
        {
          path: "/form/wizard",
          title: "Ngx Wizard",
          active: false,
          type: "link",
        },
      ],
    },
    {
      title: "Map",
      icon: "icon-location-pin",
      type: "sub",
      active: false,
      children: [
        { path: "/map/google", title: "Google Map", type: "link" },
        { path: "/map/leaflet", title: "Leaflet Map", type: "link" },
      ],
    },
    {
      title: "Tables",
      icon: "icon-harddrives",
      type: "sub",
      active: false,
      children: [
        {
          title: "Bootstrap Tables",
          type: "sub",
          children: [
            { path: "/table/basic", title: "Basic Table", type: "link" },
            { path: "/table/sizing", title: "Sizing Table", type: "link" },
            { path: "/table/border", title: "Border Table", type: "link" },
            { path: "/table/styling", title: "Styling Table", type: "link" },
          ],
        },
        {
          title: "Ngx-Datatables",
          type: "sub",
          active: false,
          children: [
            {
              path: "/table/ngx-datatables/basic",
              title: "Basic Table",
              type: "link",
            },
            {
              path: "/table/ngx-datatables/editing",
              title: "Editing Table",
              type: "link",
            },
            {
              path: "/table/ngx-datatables/filter",
              title: "Filter Table",
              type: "link",
            },
            {
              path: "/table/ngx-datatables/fullscreen",
              title: "Fullscreen Table",
              type: "link",
            },
            {
              path: "/table/ngx-datatables/paging",
              title: "Paging Table",
              type: "link",
            },
            {
              path: "/table/ngx-datatables/selection",
              title: "Selection",
              type: "link",
            },
          ],
        },
        { path: "/table/smart-table", title: "Smart Table", type: "link" },
      ],
    },
    {
      title: "Cards",
      icon: "icon-credit-card",
      type: "sub",
      active: false,
      children: [
        { path: "/cards/basic", title: "Basic Card", type: "link" },
        { path: "/cards/creative", title: "Creative Card", type: "link" },
        { path: "/cards/tabbed", title: "Tabbed Card", type: "link" },
        { path: "/cards/draggable", title: "Draggable Card", type: "link" },
      ],
    },
    {
      title: "Timeline",
      icon: "icon-panel",
      type: "sub",
      active: false,
      children: [
        { path: "/timeline/one", title: "Timeline 1", type: "link" },
        { path: "/timeline/two", title: "Timeline 2", type: "link" },
      ],
    },
    {
      title: "Charts",
      icon: "icon-bar-chart",
      type: "sub",
      active: false,
      children: [
        { path: "/chart/google", title: "Google Chart", type: "link" },
        { path: "/chart/chartjs", title: "Chartjs", type: "link" },
        { path: "/chart/chartist", title: "Chartist", type: "link" },
        { path: "/chart/ngx-chart", title: "Ngx-Charts", type: "link" },
      ],
    },
    {
      path: "/editor",
      title: "Editor",
      icon: "icon-ruler-pencil",
      type: "link",
    },
    {
      headTitle: "Apps",
      badgeType: "success",
      badgeValue: "Exclusive",
    },
    {
      title: "Users",
      icon: "icon-user",
      type: "sub",
      active: false,
      children: [
        { path: "/users/profile", title: "Users Profile", type: "link" },
        { path: "/users/edit", title: "Users Edit", type: "link" },
        { path: "/users/cards", title: "Users Cards", type: "link" },
      ],
    },
    {
      path: "/calender",
      title: "Calender",
      icon: "icon-calendar",
      type: "link",
    },
    {
      title: "Blog",
      icon: "icon-pencil-alt",
      type: "sub",
      active: false,
      children: [
        { path: "/blog/details", title: "Blog Details", type: "link" },
        { path: "/blog/single", title: "Blog Single", type: "link" },
      ],
    },
    {
      title: "Email",
      icon: "icon-email",
      type: "link",
      active: false,
      path: "/email/app",
    },
    {
      title: "Chat",
      icon: "icon-comments",
      type: "link",
      active: false,
      path: "/chat/app",
    },
    {
      title: "contact",
      icon: "icon-mobile",
      type: "link",
      path: "/contact/contacts",
    },
    {
      active: false,
      title: "To-Do",
      icon: "icon-clipboard",
      type: "sub",
      children: [
        { path: "/to-do/todo", title: "To-Do", type: "link" },
        {
          path: "/to-do/to-do-firebase",
          title: "To-Do Firebase",
          type: "link",
        },
      ],
    },
    {
      path: "/support",
      title: "Support Ticket",
      icon: "icon-headphone-alt",
      type: "link",
    },
    {
      title: "Ecommerce",
      icon: "icon-shopping-cart",
      type: "sub",
      active: false,
      children: [
        { path: "/ecommerce/products", title: "Product", type: "link" },
        {
          path: "/ecommerce/product-details/1",
          title: "Product page",
          type: "link",
        },
        {
          path: "/ecommerce/product/list",
          title: "Product list",
          type: "link",
        },
        {
          path: "/ecommerce/payment/detail",
          title: "Payment Details",
          type: "link",
        },
        { path: "/ecommerce/invoice", title: "Invoice", type: "link" },
      ],
    },
    {
      path: "/pricing",
      title: "Pricing",
      icon: "icon-money",
      type: "link",
    },
    {
      headTitle: "Pages",
    },
    {
      path: "/pages/page",
      title: "Sample page",
      icon: "icon-file",
      type: "link",
    },
    {
      path: "/search-result",
      title: "Search Pages",
      icon: "icon-search",
      type: "link",
    },
    {
      title: "Error Page",
      icon: "icon-info-alt",
      type: "sub",
      active: false,
      children: [
        { path: "error/400", title: "Error 400", type: "extTabLink" },
        { path: "error/401", title: "Error 401", type: "extTabLink" },
        { path: "error/403", title: "Error 403", type: "extTabLink" },
        { path: "error/404", title: "Error 404", type: "extTabLink" },
        { path: "error/500", title: "Error 500", type: "extTabLink" },
        { path: "error/503", title: "Error 503", type: "extTabLink" },
      ],
    },
    {
      title: "Authentication",
      icon: "icon-unlock",
      type: "sub",
      active: false,
      children: [
        {
          path: "authentication/login",
          title: "Login Simple",
          type: "extTabLink",
        },
        {
          path: "authentication/login/image",
          title: "Login with Bg Image",
          type: "extTabLink",
        },
        {
          path: "authentication/login/video",
          title: "Login with Bg video",
          type: "extTabLink",
        },
        {
          path: "authentication/register",
          title: "Register Simple",
          type: "extTabLink",
        },
        {
          path: "authentication/register/image",
          title: "Register with Bg Image",
          type: "extTabLink",
        },
        {
          path: "authentication/register/video",
          title: "Register with Bg video",
          type: "extTabLink",
        },
        {
          path: "authentication/unlockuser",
          title: "Unlock User",
          type: "extTabLink",
        },
        {
          path: "authentication/forgetpassword",
          title: "Forget Password",
          type: "extTabLink",
        },
        {
          path: "authentication/resetpassword",
          title: "Reset Password",
          type: "extTabLink",
        },
      ],
    },
    {
      title: "Coming Soon",
      icon: "icon-video-clapper",
      type: "sub",
      active: false,
      children: [
        { path: "comingsoon/page", title: "Coming Simple", type: "extTabLink" },
        {
          path: "comingsoon/page/image",
          title: "Coming with Bg Image",
          type: "extTabLink",
        },
        {
          path: "comingsoon/page/video",
          title: "Coming with Bg video",
          type: "extTabLink",
        },
      ],
    },
    {
      path: "maintenance",
      title: "Maintenance",
      icon: "icon-settings",
      type: "extTabLink",
    },
  ];

  securityLevels = [
    { name: "MFA", value: "MFA" },
    { name: "Password", value: "Password" },
  ];

  accessLevels = [
    {
      title: "Co-owner",
      type: "Co-owner",
      value: "coowner",
      status: "Awaiting Completion",
    },
    {
      title: "Approve and Edit",
      type: "Approve and Edit",
      value: "approveEdit",
      status: "Awaiting Completion",
    },
    {
      title: "Approve",
      type: "Approve",
      value: "approve",
      status: "Awaiting Completion",
    },
    { title: "Edit", type: "Edit", value: "edit", status: "Completed" },
    {
      title: "Comment",
      type: "Comment",
      value: "comment",
      status: "Completed",
    },
    { title: "View", type: "View", value: "view", status: "Completed" },
  ];

  fileTypes = [
    {
      name: "Documents",
      value: "documents",
    },
    {
      name: "Sections",
      value: "sections",
    },
    {
      name: "Smart Contracts",
      value: "scontracts",
    },
  ];

  editorConfig = {
    toolbar: {
      items: [
        "|",
        "bold",
        "italic",
        "fontSize",
        "fontColor",
        "fontBackgroundColor",
        "fontFamily",
        "highlight",
        "bulletedList",
        "numberedList",
        "|",
        "blockQuote",
        "specialCharacters",
        "subscript",
        "superscript",
        "|",
        "indent",
        "outdent",
        "alignment",
        "|",
        "imageUpload",
        "insertTable",
        "mediaEmbed",
        "link",
        "|",
        "undo",
        "redo",
      ],
    },
    language: "en",
    image: {
      toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
  };

  locations = [
    { place: "Arizona ,USA" },
    { place: "NY , USA" },
    { place: "Sydney , Australia" },
    { place: "London , UK" },
    { place: "Berlin , Germany" },
  ];
  plans = [
    { name: "Basic", price: 249.99 },
    { name: "Pro", price: 0 },
    { name: "Premium", price: 0 },
  ];
}
