import {CreateAccessLinkType, DeleteAccessLinkType, GetAccessLinkType, UpdateAccessLinkType} from "./AccessLink.model";
import {AccessLink} from "../database/models";

export interface AccessLinkRepositoryInterface {
    getAccessLink(input:GetAccessLinkType):Promise<AccessLink[]>
    createAccessLink(input:CreateAccessLinkType):Promise<AccessLink>
    deleteAccessLink(input:DeleteAccessLinkType):Promise<AccessLink>
    updateAccessLink(input:UpdateAccessLinkType):Promise<AccessLink>
}