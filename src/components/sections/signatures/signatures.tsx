"use client";

import type { User } from "@supabase/supabase-js";
import posthog from "posthog-js";
import { useCallback, useEffect, useRef, useState } from "react";

import SignatureModal from "@/components/sections/signatures/signature-modal";
import SignatureWall from "@/components/sections/signatures/signature-wall";
import {
  buildAuthRedirectUrl,
  consumeSignFlag,
  hasSignIntent,
  hasSigned,
  insertSignature,
  loadSignatures,
  readAuthCallbackError,
  setSignIntent,
  SIGNATURE_ERRORS,
} from "@/lib/signatures";
import { supabase } from "@/lib/supabase";
import type { Signature, SignaturePayload } from "@/types";

const asMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * Stateful half of the sign:wall section — owns the signatures, the Google
 * session, and the modal. The two components below it are presentational.
 */
const Signatures: React.FC = () => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  // Nothing to wait for when there is no database to load them from.
  const [loading, setLoading] = useState(Boolean(supabase));
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [authWaiting, setAuthWaiting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Survives the redirect to Google and back, and is cleared the moment it is
  // acted on so a later sign-in does not pop the modal unprompted.
  const signIntentRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    try {
      setSignatures(await loadSignatures(supabase));
    } catch (error) {
      setSignatures([]);
      setErrorMessage(asMessage(error, SIGNATURE_ERRORS.SAVE_FAILED));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    // Read what Google left on the URL up front: `?sign=1` rides along on the
    // redirect back, and localStorage is the fallback for when the provider
    // drops the query string.
    const callbackError = readAuthCallbackError();
    signIntentRef.current = consumeSignFlag() || hasSignIntent();

    // Everything below runs from the auth subscription rather than the effect
    // body. supabase-js emits INITIAL_SESSION as soon as it has finished the
    // OAuth round trip, so that is the earliest point where the page knows who
    // it is talking to — and it fires whether or not anyone is signed in.
    const { data } = client.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (event === "INITIAL_SESSION") {
        if (callbackError) setErrorMessage(callbackError);
        if (signIntentRef.current) setAuthWaiting(true);
        void refresh();
      }

      if (!nextUser) {
        setAlreadySigned(false);

        // No session by INITIAL_SESSION means the login never landed.
        if (event === "INITIAL_SESSION" && signIntentRef.current) {
          signIntentRef.current = false;
          setSignIntent(false);
          setAuthWaiting(false);
          setErrorMessage(
            (current) => current || SIGNATURE_ERRORS.AUTH_FINISH_LOGIN
          );
        }
        return;
      }

      void (async () => {
        let signed = false;

        try {
          signed = await hasSigned(client, nextUser.id);
        } catch (error) {
          setAuthWaiting(false);
          setErrorMessage(asMessage(error, SIGNATURE_ERRORS.SAVE_FAILED));
          return;
        }

        setAlreadySigned(signed);
        setAuthWaiting(false);

        if (!signIntentRef.current) return;

        signIntentRef.current = false;
        setSignIntent(false);

        document
          .getElementById("sign")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });

        // Coming back from Google having already signed is not an error — the
        // wall says so permanently now, so there is nothing to raise here.
        if (!signed) setModalOpen(true);
      })();
    });

    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const openModal = async () => {
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage(SIGNATURE_ERRORS.NOT_CONFIGURED);
      return;
    }

    posthog.capture('"Add your signature" button clicked', { Clicked: true });

    if (!user) {
      setAuthWaiting(true);
      signIntentRef.current = true;
      setSignIntent(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: buildAuthRedirectUrl(),
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) {
        setAuthWaiting(false);
        signIntentRef.current = false;
        setSignIntent(false);
        setErrorMessage(
          /unsupported provider/i.test(error.message)
            ? SIGNATURE_ERRORS.GOOGLE_PROVIDER_DISABLED
            : error.message
        );
      }
      return;
    }

    // No `alreadySigned` guard here — the button says "sign out" in that state,
    // and the unique constraint is the real backstop if one ever slips through.
    setModalOpen(true);
  };

  /**
   * One signature per account, so switching accounts is the only way to add
   * another. Ending the session is the first half of that; the button flips
   * back to "Add your signature" and starts a fresh Google login, which prompts
   * for account selection.
   */
  const signOut = async () => {
    if (!supabase) return;

    setErrorMessage("");
    posthog.capture('"Sign out" button clicked', { Clicked: true });

    const { error } = await supabase.auth.signOut();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // `onAuthStateChange` clears `user` and `alreadySigned` on SIGNED_OUT, so
    // there is no local state to reset here.
    setSignIntent(false);
    signIntentRef.current = false;
  };

  const submit = async (payload: SignaturePayload) => {
    if (!supabase || !user) {
      setErrorMessage(SIGNATURE_ERRORS.AUTH_REQUIRED);
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      await insertSignature(supabase, user.id, payload);
      setAlreadySigned(true);
      setModalOpen(false);
      await refresh();
      posthog.capture("Signature placed", { Signed: true });
    } catch (error) {
      setErrorMessage(asMessage(error, SIGNATURE_ERRORS.SAVE_FAILED));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SignatureWall
        signatures={signatures}
        loading={loading}
        // The modal renders its own copy, and showing it twice reads as two
        // separate things going wrong.
        errorMessage={modalOpen ? "" : errorMessage}
        connected={Boolean(supabase)}
        authWaiting={authWaiting}
        alreadySigned={alreadySigned}
        signedInEmail={user?.email ?? ""}
        onOpen={openModal}
        onSignOut={signOut}
      />

      <SignatureModal
        open={modalOpen}
        saving={saving}
        errorMessage={errorMessage}
        signedInEmail={user?.email ?? ""}
        onClose={() => {
          setModalOpen(false);
          setErrorMessage("");
        }}
        onSubmit={submit}
      />
    </>
  );
};

export default Signatures;
