
import Dashboard from "@/pages/Dashboard.tsx";
import Applicants from "@/pages/Applicants.tsx";
import Purchasers from "@/pages/Purchasers.tsx";
import Companies from "@/pages/Companies.tsx";
import Products from "@/pages/Products.tsx";
import Projects from "@/pages/Projects.tsx";
import ProjectDetail from "@/pages/ProjectDetail.tsx";
import ContractDetail from "@/pages/ContractDetail.tsx";
import NewContract from "@/pages/NewContract.tsx";
import EditContract from "@/pages/EditContract.tsx";
import Currencies from "@/pages/Currencies.tsx";
import Units from "@/pages/Unit/Units.tsx";
import Links from "@/pages/Links.tsx";
import GuestProjectDetail from "@/pages/GuestProjectDetail.tsx";
import GuestContractDetail from "@/pages/GuestContractDetail.tsx";
import UnableToLoadData from "@/pages/ErrorPages/UnableToLoadData.tsx";
import ServerError from "@/pages/ErrorPages/ServerError.tsx";
import AccessDenied from "@/pages/ErrorPages/AccessDenied.tsx";
import NotFound from "@/pages/NotFound.tsx";

export const privateRoutes = [
    {
        path:"/",
        element:Projects
    },
    {
        path:"/applicants",
        element:Applicants
    },
    {
        path:"/purchasers",
        element:Purchasers
    },
    {
        path:"/companies",
        element:Companies
    },
    {
        path:"/products",
        element:Products
    },
    {
        path:"/projects",
        element:Projects
    },
    {
        path:"/projects/:id",
        element:ProjectDetail
    },
    {
        path:"/projects/:projectId/contracts/:contractId",
        element:ContractDetail
    },
    {
        path:"/projects/:projectId/contracts/new",
        element:NewContract
    },
    {
        path:"/projects/:projectId/contracts/edit/:contractId",
        element:EditContract
    },
    {
        path:"/projects/:projectId/contracts/:contractId",
        element:ContractDetail
    },
    {
        path:"/currencies",
        element:Currencies
    },

    {
        path:"/units",
        element:Units
    },
    // {
    //     path:"/links",
    //     element:Links
    // },


    ]

export const guestRoutes = [
    {
        path:"/guest/projects/:id",
        element:GuestProjectDetail
    },
    {
        path:"/guest/projects/:projectId/contracts/:contractId",
        element:GuestContractDetail
    },
]
export const publicRoutes = [
    {
        path:"/error/unable-to-load",
        element:UnableToLoadData
    },
    {
        path:"/error/server-error",
        element:ServerError
    },
    {
        path:"/error/access-denied",
        element:AccessDenied
    },
    {
        path:"*",
        element:NotFound
    },
    ]
