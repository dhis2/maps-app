import { combineEpics } from 'redux-observable';
import i18next from 'i18next';
import * as types from '../constants/actionTypes';
import { apiFetch } from '../util/api';
import { setMessage } from '../actions/message';
import { getInstance as getD2 } from 'd2/lib/d2';
import { interpretationsFields } from '../util/helpers';
import { closeLayersPanel, openRightPanel } from '../actions/ui';
import { loadInterpretations, setInterpretations } from '../actions/interpretations'
import { setCurrentInterpretation } from '../actions/favorites'

export const saveInterpretationLike = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_SAVE_LIKE_VALUE)
        .concatMap(action =>
            apiFetch(`/interpretations/${action.interpretation.id}/like`, action.value ? "POST" : "DELETE", {})
                .then(() => loadInterpretations())
        );

export const deleteInterpretation = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_DELETE)
        .concatMap(action => apiFetch(`/interpretations/${action.interpretation.id}`, "DELETE", {}))
        .mergeMap(res => [
            setMessage(i18next.t("Interpretation deleted")),
            loadInterpretations(),
            setCurrentInterpretation(null),
        ]);

export const loadInterpretationsEpic = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_LOAD)
        .concatMap(action => {
            const mapId = store.getState().map.id;
            const fields = `interpretations[${interpretationsFields.join(',')}]`;
            return apiFetch(`/maps/${mapId}?fields=${fields}`, "GET")
                .then(res => setInterpretations(res.interpretations))
        });

export const saveInterpretation = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_SAVE)
        .concatMap(action => {
            const { interpretation } = action;
            const mapId = store.getState().map.id;
            const [method, url] = interpretation.id
                ? ['PUT',  `/interpretations/${interpretation.id}`]
                : ['POST', `/interpretations/map/${mapId}`];
            return apiFetch(url, method, interpretation.text);
        }).mergeMap(response => [
            setMessage(i18next.t("Interpretation saved")),
            loadInterpretations(),
            openRightPanel(),
        ]);

export const saveComment = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_SAVE_COMMENT)
        .concatMap(action => {
            const { interpretation, comment } = action;
            const [method, url] = comment.id
                ? ['PUT',  `/interpretations/${interpretation.id}/comments/${comment.id}`]
                : ['POST', `/interpretations/${interpretation.id}/comments`];
            return apiFetch(url, method, comment.text);
        }).mergeMap(response => [
            setMessage(i18next.t('Interpretation comment saved')),
            loadInterpretations(),
        ]);

export const deleteComment = (action$, store) =>
    action$
        .ofType(types.INTERPRETATIONS_DELETE_COMMENT)
        .concatMap(({ interpretation, comment }) => {
            const url = `/interpretations/${interpretation.id}/comments/${comment.id}`;
            return apiFetch(url, "DELETE", {});
        }).mergeMap(res => [
            setMessage(i18next.t("Interpretation comment deleted")),
            loadInterpretations(),
        ]);

export default combineEpics(
    saveInterpretationLike,
    deleteInterpretation,
    loadInterpretationsEpic,
    saveInterpretation,
    saveComment,
    deleteComment,
);
